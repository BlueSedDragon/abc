/*
    | Encoding: UTF-8
    | URL: https://github.com/BlueSedDragon/abc
    | License: GPLv3 or later
*/

var inits = [];

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
}
Array.prototype.shuffle = function () {
    var arr = [...(new Set(this))];
    var narr = (new Set());

    var arrlen = arr.length;
    while (narr.size < arrlen) {
        narr.add(arr.random());
    }

    return [...narr];
}

var base = null;
var base_auto = true;

function base_get(userinput) {
    if (userinput) base_auto = false;
    else base_auto = true;

    var id = 'code-mode';
    var object = document.getElementById(id);
    var value = object.value;

    value = Number(value);

    if (!Number.isSafeInteger(value))
        throw (new Error('$value is not a integer!'));

    base = value;
    display_update();
    if (!base_auto) table_get();
}
function base_set(value) {
    var id = 'code-mode';
    var object = document.getElementById(id);
    object.value = String(value);
    base_get();
}

var char = [];
function char_test(blacklist) { // 用于进行屏蔽词测试。输入屏蔽词库，输出有风险的组合。请根据情况调节字符集。
    var hint = [];
    for (let word of blacklist) {
        let found = true;
        for (let i of word) {
            if (char.indexOf(i) === -1) {
                found = false;
                break;
            }
        }
        if (found) hint.push(word);
    }
    return hint;
}

// rust range: min..=max
function integer_random(min, max) {
    if (!Number.isSafeInteger(min)) throw (new Error('bad $min type.'));
    if (!Number.isSafeInteger(max)) throw (new Error('bad $max type.'));

    if (min === max) return min;

    if (
        (min < 0 || max < 0) ||
        min > max
    ) throw (new Error('bad range!'));

    var result = null;

    var _max = max + 1;
    do {
        result = Math.floor(Math.random() * _max);
    } while (result < min || result > max);

    return result;
}

function char_random() {
    var result = null;

    do {
        result = integer_random(0x4e00, 0x9fa5);

        result = result.toString(16);
        if ((result.length % 2) !== 0) result = '0' + result;

        result = `"\\u${result}"`;
        result = JSON.parse(result);
    } while (result.length !== 1);
    return result;
}

var char_builtin = (function () {
    var chars = {
        0: '之乎者也何乃若及哉亦以而其爲則矣',
        1: '子丑寅卯辰巳午未申酉戌亥东南西北',
        5: '将于从在把被让给和与或的得地则以',
        6: '东南西北上下左右先大小长短前后面',
        7: '蓝红墨绿灰白黑黄橙橘紫棕褐青靛彩',
        8: '米酱油盐糖醋豆豉酒葱姜蒜椒芹茄料',
        9: '氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹镆',
        10: '元角秒分时日月年寸米里厘毫斤吨克',
    };

    return (function (seq) {
        base_auto = true;

        var data = null;
        if (seq < 0) {
            switch (seq) {
                default:
                    throw (new Error('bad $seq.'));
            }
        } else { // select
            data = chars[seq];
            if (!data) throw (new Error('$seq is not found.'));
        }

        document.getElementById('gen-table-body').value = data;
        table_get();
    });
})();

var table = [];
function table_get() {
    var id = 'gen-table-body';
    var object = document.getElementById(id);
    var data = object.value;

    table_update(str2char(data));
}
function table_update(data) {
    if (base_auto) {
        if (data.length >= 256) base_set(256);
        else if (data.length < 256) base_set(16);
    }

    char = data;
    table = char2table(char);
    display_update();
}
function table_random() {
    table_update(char.shuffle());
}

function display_update() {
    var body = document.getElementById('gen-table-display-body');
    var count = document.getElementById('gen-table-display-count');
    var info = document.getElementById('gen-table-display-info');

    body.innerHTML = char.join('');

    var charlen = char.length;
    count.innerHTML = String(charlen);

    if (charlen < base) info.innerHTML = `<span style="color:red;">注意：字符集不全，至少需要 ${base} 个（还差 ${base - charlen} 个）。</span><br/>`;
    else info.innerHTML = '';
}

var str2char = (function () {
    var band = (new Set([
        '', '：', '‘', '’', '，', '。', '、', '！', '“', '”',
        '？', '（', '）', '《', '》', '－', '「', '」', '；'
    ]));

    return (function (data) {
        var char = (new Set());
        for (let seq in data) {
            let num = data.charCodeAt(seq);
            if (num <= 0xff) continue; // in the ASCII Range
            if (num < 0x4e00 || num > 0x9fa5) continue; // not in the CJK Range

            let str = data[seq];
            if ((!str) || band.has(str)) continue;
            char.add(str);
        }
        return [...char];
    });
})();

// rust range: start..=end
function loop(start, end) {
    if (!Number.isSafeInteger(start)) throw (new Error('bad $start type.'));
    if (!Number.isSafeInteger(end)) throw (new Error('bad $end type.'));

    if (start > end) throw (new Error('bad range!'));

    var count = start;
    return (function () {
        if (count > end)
            count = start;

        return (count++);
    });
}

function char2table(char) {
    var once_char = [...char];
    var new_table = [];

    var counter = loop(0, base - 1);
    while (once_char.length > 0) {
        let index = counter();
        if (!(new_table[index])) new_table[index] = [];
        new_table[index].push(once_char.pop());
    }
    return new_table;
}

var hex2buf = (function () {
    var list = '0123456789abcdef'.toLowerCase();
    return (function (hex) {
        if ((typeof hex) !== 'string') throw (new Error('bad $hex type.'));
        if ((hex.length % 2) !== 0) throw (new Error('bad $hex length.'));

        hex = hex.toLowerCase();
        for (let i of hex) {
            if (list.indexOf(i) === -1) throw (new Error('invalid char in $hex.'));
        }

        var buf = [];
        while (hex.length > 0) {
            buf.push(parseInt(hex.slice(0, 2), 16));
            hex = hex.slice(2);
        }
        buf = (new Uint8Array(buf));
        return buf;
    });
})();

function buf2hex(buf) {
    if (buf.constructor !== Uint8Array) throw (new Error('bad $buf type.'));

    var hex = [];
    for (let i of buf) {
        let ii = i.toString(16);
        if (ii.length < 2) ii = ('0' + ii);
        hex.push(ii);
    }
    hex = hex.join('');
    return hex;
}

function str2buf(str) {
    if ((typeof str) !== 'string') throw (new Error('bad $str type.'));

    var buf = [];
    for (let i = 0, l = str.length; i < l; ++i) {
        let tmp = str.charCodeAt(i);
        if (tmp <= 255) { // ascii handle.
            buf.push(tmp);
            continue;
        }

        // other handle.
        let ii = str[i];
        tmp = encodeURIComponent(ii).split('%');
        tmp.shift();
        for (let iii of tmp) {
            buf.push(parseInt(iii, 16));
        }
    }
    buf = (new Uint8Array(buf));
    return buf;
}
function buf2str(buf) {
    if (buf.constructor !== Uint8Array) throw (new Error('bad $buf type.'));

    var str = [];
    for (let i of buf) {
        str.push('%');

        let ii = i.toString(16);
        if (ii.length < 2) ii = ('0' + ii);
        str.push(ii);
    }
    str = decodeURIComponent(str.join(''));
    return str;
}

function thuum_base16_encode(input) {
    if (input.constructor !== Uint8Array) input = str2buf(input);

    var output = [];
    for (let i of input) {
        let hex = i.toString(16);
        if (hex.length < 2) hex = ('0' + hex);

        let a = parseInt(hex[0], 16); // 1 of 2
        let b = parseInt(hex[1], 16); // 2 of 2

        a = table[a].random();
        b = table[b].random();

        let c = a + b;
        output.push(c);
    }
    output = output.join('');
    return output;
}
function thuum_base16_decode(raw_input) {
    if ((typeof raw_input) !== 'string') raw_input = buf2str(raw_input);

    var input = [];
    for (let i of raw_input) {
        if (char.indexOf(i) === -1) continue;
        input.push(i);
    }
    input = input.join('');

    if ((input.length % 2) !== 0) throw (new Error('bad $input length.'));

    var table_reverse = {};
    for (let i = 0; i < 16; ++i) {
        for (let ii of table[i]) {
            table_reverse[ii] = i;
        }
    }

    var output = [];
    for (let i = 0, l = input.length; i < l; i += 2) {
        let a = input[i]; // 1 of 2
        let b = input[i + 1]; // 2 of 2
        a = table_reverse[a];
        b = table_reverse[b];

        if (
            ((!a) && a !== 0) ||
            ((!b) && b !== 0)
        ) {
            /* skip the check of invalid char, because used the mix. */

            //throw (new Error(`UserInput: the mapping of char ${JSON.stringify(i)} is not found.`));
            continue;
        }

        a = a.toString(16);
        b = b.toString(16);

        let c = parseInt(a + b, 16);
        output.push(c);
    }
    output = (new Uint8Array(output));
    return output;
}

function thuum_base256_encode(input) {
    if (input.constructor !== Uint8Array) input = str2buf(input);

    var output = [];
    for (let i of input) {
        let ii = table[i].random();
        output.push(ii);
    }
    output = output.join('');
    return output;
}
function thuum_base256_decode(raw_input) {
    if ((typeof raw_input) !== 'string') raw_input = buf2str(raw_input);

    var input = [];
    for (let i of raw_input) {
        if (char.indexOf(i) === -1) continue;
        input.push(i);
    }
    input = input.join('');

    var table_reverse = {};
    for (let i = 0; i < 256; ++i) {
        for (let ii of table[i]) {
            table_reverse[ii] = i;
        }
    }

    var output = [];
    for (let i of input) {
        let ii = table_reverse[i];
        output.push(ii);
    }
    output = (new Uint8Array(output));
    return output;
}

function thuum_encode(input) {
    var output = null;
    switch (base) {
        case 16:
            output = thuum_base16_encode(input);
            break;
        case 256:
            output = thuum_base256_encode(input);
            break;
        default:
            throw (new Error('bad $base.'));
    }
    return output;
}
function thuum_decode(input) {
    var output = null;
    switch (base) {
        case 16:
            output = thuum_base16_decode(input);
            break;
        case 256:
            output = thuum_base256_decode(input);
            break;
        default:
            throw (new Error('bad $base.'));
    }
    return output;
}

function sha256(input) {
    if ((typeof input) !== 'string') {
        if (input.constructor === Uint8Array) input = buf2str(input);
        else throw (new Error('bad $input type.'));
    }

    var hex = (new Hashes.SHA256()).hex(input);
    var output = hex2buf(hex);
    return output;
}

var sha256_cached = (function () {
    var cache = {};
    return (function (input) {
        var output = cache[input];
        if (output) return output;

        output = sha256(input);
        cache[input] = output;
        return output;
    });
})();

var iv_length = null; // byte
var iv_length_check = (function () {
    // rust range: length_min..=length_max
    var length_min = 16;
    var length_max = 1024;

    inits.push(function () {
        document.getElementById('crypt-iv-range').innerHTML = `${String(length_min).toLowerCase()} ~ ${String(length_max).toLowerCase()}`;
    });

    return (function (length) {
        if (
            (!length) ||
            (length < length_min || length > length_max)
        ) throw (new Error('bad $iv_length.'));
    });
})();

var aes256ctr_iv = (function () {
    var list = (new Set());

    var generate = (function () {
        get_iv_length();

        var data = (new Uint8Array(iv_length));
        var iv = (new Uint8Array(iv_length));

        data[0] = 1;
        iv[0] = 2;

        var password = [];
        password.push(String(Date.now()));
        for (let i = 0; i < 1000; ++i) {
            password.push(String(Math.random()));
            password.push(String(Math.random()));
        }
        password = password.join('');

        var new_iv = aes256ctr_encrypt(data, password, iv);
        return new_iv;
    });

    return (function () {
        var iv = null;
        var iv_hex = null;
        do {
            iv = generate();
            iv_hex = buf2hex(iv).toLowerCase();
        } while (list.has(iv_hex));
        list.add(iv_hex);
        return iv;
    });
})();

function aes256ctr_encrypt(input, password, iv) {
    if (input.constructor !== Uint8Array) input = str2buf(input);
    if ((typeof password) !== 'string') password = buf2str(password);

    if (iv.constructor !== Uint8Array) throw (new Error('bad $iv type.'));
    if (iv.length !== iv_length) throw (new Error('bad $iv length.'));
    iv = buf2hex(iv).toLowerCase();

    password = str2buf(password);
    password = buf2hex(password);

    var key = sha256(`${iv}#${password}`);

    var cipher = (new aesjs.ModeOfOperation.ctr(key, (new aesjs.Counter(0))));
    var output = cipher.encrypt(input);

    return output;
}
var aes256ctr_decrypt = aes256ctr_encrypt;

function mix_sentence(input) {
    if ((typeof input) !== 'string') throw (new Error('bad $input type.'));

    var half = '，';
    var dot = '。';

    var output = [];

    var sent_end = true;
    while (input.length > 0) {
        let jump = (Math.floor(Math.random() * 10) + 2);

        let part = input.slice(0, jump);
        input = input.slice(jump);

        output.push(part);

        let split = ((Math.floor(Math.random() * 10) < 5) ? half : dot);
        if (sent_end) split = half;

        if (split === dot) sent_end = true;
        else sent_end = false;

        output.push(split);
    }

    {
        let end = output[output.length - 1];
        if (end === half || end === dot) output.pop();
    }
    if (output[output.length - 1] !== dot && output.length > 0) output.push(dot);

    output = output.join('');
    return output;
}
function mix_poesy(input, fill) {
    var jump = 5;

    var half = '，';
    var dot = '。';

    if ((typeof input) !== 'string') throw (new Error('bad $input type.'));

    if (!Array.isArray(fill)) throw (new Error('bad $fill type.'));
    fill = [...(new Set(fill))];
    if (fill.length < jump) throw (new Error('bad $fill length.'));

    var output = [];
    while (input.length > 0) {
        let first = input.slice(0, jump);
        input = input.slice(jump);

        let second = input.slice(0, jump);
        input = input.slice(jump);

        while (first.length < jump) first += fill.random();
        output.push(first);
        output.push(half);

        while (second.length < jump) second += fill.random();
        output.push(second);
        output.push(dot);

        output.push('\r\n');
    }

    output = output.join('');
    return output;
}
var mix = mix_sentence;

function get_crypt_mode() {
    return document.getElementById('crypt-mode').value.toLowerCase();
}

function get_iv_length() {
    var len = document.getElementById('crypt-iv-length').value;
    len = Number(len);

    if (!Number.isSafeInteger(len))
        throw (new Error('$len is not a integer!'));

    iv_length_check(len);

    iv_length = len;
    return len;
}

function get_password() {
    var id = 'crypt-password';
    var password = document.getElementById(id).value;
    return password;
}

function get_input() {
    var id = 'io-input';
    return document.getElementById(id).value;
}
function set_output(data) {
    var id = 'io-output';
    document.getElementById(id).value = data;
}

function main(type) {
    if ((typeof type) !== 'number' || Number.isNaN(type)) return null;
    if ((!Number.isInteger(type)) || (!Number.isSafeInteger(type))) return null;

    if (char.length < base) {
        alert('字符集不全！需要生成字符集后才能使用。');
        return;
    }

    var crypt_mode = get_crypt_mode();
    var input = str2buf(get_input());

    var output = null;
    set_output('');
    switch (type) {
        case 0: // encode
            output = input;
            switch (crypt_mode) {
                case 'none':
                    break;
                case 'aes-256-ctr':
                    get_iv_length();

                    let password = get_password();
                    let iv = aes256ctr_iv();

                    output = aes256ctr_encrypt(output, password, iv);
                    output = (new Uint8Array([].concat([...iv], [...output])));
                    break;
                default:
                    break;
            }
            output = mix(thuum_encode(output));
            break;
        case 1: // decode
            output = thuum_decode(input);
            switch (crypt_mode) {
                case 'none':
                    break;
                case 'aes-256-ctr':
                    get_iv_length();

                    let password = get_password();

                    if (output.length < iv_length)
                        throw (new Error('bad $output length.'));

                    let iv = output.slice(0, iv_length);
                    output = output.slice(iv_length);

                    output = aes256ctr_decrypt(output, password, iv);
                    break;
                default:
                    break;
            }
            output = buf2str(output);
            break;
        default:
            throw (new Error('bad $type.'));
    }
    set_output(output);
}

function test() {
    /* TEST START */

    // var
    var foo1 = 0;

    // let
    let foo2 = 0;

    // while
    while (0) { }

    // do-while
    do { } while (0);

    // switch
    switch (foo1) {
        case 0:
            break;
        case 1:
            break;
        default:
            break;
    }

    // for-in
    for (let i in ['d', 'e', 'f']) { }

    // for-of
    for (let i of ['x', 'y', 'z']) { }

    // Uint8Array()
    {
        let tmp = (new Uint8Array());
        tmp[0] = 1;
        tmp[1] = 1;
        tmp = (new Uint8Array(16));
        tmp = (new Uint8Array([1, 2, 3]));
        tmp.length;
    }

    // Set()
    {
        let tmp = (new Set());
        tmp.add(1);
        tmp.delete(2);
        tmp.clear();
        tmp = (new Set(['a', 'b', 'c']));
        tmp.size;
    }

    // encodeURI()
    {
        let tmp = encodeURI('测试');
        tmp = decodeURI(tmp);

        tmp = encodeURIComponent('你好');
        tmp = decodeURIComponent(tmp);
    }

    /* TEST SUCCESS */

    var id = 'test';
    document.getElementById(id).style.display = 'none';
}

var init = (function () {
    var called = false;
    return (function () {
        if (called) return;
        called = true;

        test();

        get_iv_length();

        base_get();
        table_get();
        display_update();

        window.addEventListener('error', function (event) {
            console.error(event);
            alert(`${event.message}\n\n${event.error ? event.error.stack : ''}`);
        });
    });
})();
inits.push(init);

if (document) {
    let called = false;
    document.addEventListener('DOMContentLoaded', function (event) {
        if (called) return;
        called = true;

        for (let it of inits) {
            it();
        }
    });
}
