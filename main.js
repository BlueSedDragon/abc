/*
    | Encoding: UTF-8
    | URL: https://github.com/BlueSedDragon/abc
    | License: GPLv3 or later
*/

'use strict';

var inits = [];

function array_random(self) {
    return self[Math.floor(Math.random() * self.length)];
}

function array_shuffle(self) {
    var arr = [...(new Set(self))];
    var narr = (new Set());

    var arrlen = arr.length;
    while (narr.size < arrlen) {
        narr.add(array_random(arr));
    }

    return [...narr];
}

function string_replaceAll(self, from, to) {
    let string = String(self);
    if (Array.isArray(from)) {
        for (let i of from) {
            while (string.indexOf(i) !== -1)
                string = string.replace(i, to);
        }
    } else {
        if ((typeof from) !== 'string') from = String(from);
        while (string.indexOf(from) !== -1)
            string = string.replace(from, to);
    }
    return string;
};

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

{
    let chars = {
        0: '之乎者也何乃若及哉亦以而其爲則矣',
        1: '子丑寅卯辰巳午未申酉戌亥东南西北',
        5: '将于从在把被让给和与或的得地则以',
        6: '东南西北上下左右先大小长短前后面',
        7: '蓝红墨绿灰白黑黄橙橘紫棕褐青靛彩',
        8: '米酱油盐糖醋豆豉酒葱姜蒜椒芹茄料',
        9: '氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹镆',
        10: '元角秒分时日月年寸米里厘毫斤吨克',
    };

    var char_builtin = (function (seq) {
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
}

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
    table_update(array_shuffle(char));
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

{
    let band = (new Set([
        '', '：', '‘', '’', '，', '。', '、', '！', '“', '”',
        '？', '（', '）', '《', '》', '－', '「', '」', '；'
    ]));

    var str2char = (function (data) {
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
}

// rust range: start..=end
function loop(start, end) {
    if (!Number.isSafeInteger(start)) throw (new Error('bad $start type.'));
    if (!Number.isSafeInteger(end)) throw (new Error('bad $end type.'));

    if (start > end) throw (new Error('bad range!'));

    var count = start;
    return (() => {
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

function buf_clone(buf) {
    if (buf.constructor !== Uint8Array) throw (new Error('bad $buf type.'));

    var result = (new Uint8Array(buf.length));
    result.set(buf, 0);

    return result;
}
function buf_concat(bufs) {
    if (!Array.isArray(bufs)) throw (new Error('bad $bufs type.'));

    var total = 0;
    for (let it of bufs) {
        if (it.constructor !== Uint8Array) throw (new Error('bad $it type.'));
        total += it.length;
    }

    var result = (new Uint8Array(total));

    var offset = 0;
    for (let it of bufs) {
        result.set(it, offset);
        offset += it.length;
    }

    return result;
}

function buf_equal(a, b) {
    if (a.constructor !== Uint8Array) throw (new Error('bad $a type.'));
    if (b.constructor !== Uint8Array) throw (new Error('bad $b type.'));

    var alen = a.length;
    if (alen !== b.length) return false;

    for (let i = 0; i < alen; ++i) {
        let it_a = a[i];
        let it_b = b[i];

        if (it_a !== it_b) return false;
    }

    return true;
}

{
    let mapping = {};
    for (let i = 0; i <= 0xff; ++i) {
        let ii = i.toString(16);
        if (ii.length < 2) ii = ('0' + ii);
        mapping[ii] = i;
    }

    let list = '0123456789abcdef'.toLowerCase();

    var hex2buf = (function (hex) {
        if ((typeof hex) !== 'string') throw (new Error('bad $hex type.'));
        if ((hex.length % 2) !== 0) throw (new Error('bad $hex length.'));

        hex = hex.toLowerCase();
        for (let i of hex) {
            if (list.indexOf(i) === -1) throw (new Error('invalid char in $hex.'));
        }

        var buf = [];
        while (hex.length > 0) {
            let it = hex.slice(0, 2);
            it = mapping[it];
            buf.push(it);

            hex = hex.slice(2);
        }
        buf = (new Uint8Array(buf));
        return buf;
    });
}

{
    let mapping = {};
    for (let i = 0; i <= 0xff; ++i) {
        let ii = i.toString(16);
        if (ii.length < 2) ii = ('0' + ii);
        mapping[i] = ii;
    }

    var buf2hex = (function (buf) {
        if (buf.constructor !== Uint8Array) throw (new Error('bad $buf type.'));

        var hex = [];
        for (let it of buf) {
            it = mapping[it];
            hex.push(it);
        }
        hex = hex.join('');
        return hex.toLowerCase();
    });
}

function str2buf(str) {
    if ((typeof str) !== 'string') throw (new Error('bad $str type.'));

    var buf = (new TextEncoder('utf-8')).encode(str);
    return buf;
}
function buf2str(buf) {
    if (buf.constructor !== Uint8Array) throw (new Error('bad $buf type.'));

    var str = (new TextDecoder('utf-8')).decode(buf);
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

        a = array_random(table[a]);
        b = array_random(table[b]);

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
        let ii = array_random(table[i]);
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

async function hash(algo, input) {
    if (input.constructor !== Uint8Array) input = str2buf(input);

    var output = await crypto.subtle.digest(algo, input);
    output = (new Uint8Array(output));
    return output;
}

async function sha512(input) {
    var output = await hash('SHA-512', input);
    return output;
}
async function sha256(input) {
    var output = await hash('SHA-256', input);
    return output;
}

async function hash_time(func) {
    if ((typeof func) !== 'function') throw (new Error('bad $func type.'));

    var count_total = 10;
    var count_single = 5;

    var data = random(1024);
    var delays = [];
    for (let i = 0; i < count_total; ++i) {
        let start = Date.now();
        for (let ii = 0; ii < count_single; ++ii) {
            data = await func(data);
        }
        let end = Date.now();

        let delay = (end - start) / count_single;
        delays.push(delay);
    }

    var sum = 0;
    for (let it of delays) {
        sum += it;
    }

    var delay = sum / delays.length;
    if (delay <= 0) delay = 0.001;

    return delay;
}

async function sha512_time() {
    var delay = await hash_time((input) => sha512(input));
    return delay;
}
async function pbkdf2_time(iters) {
    var delay = await hash_time((input) => pbkdf2(input, iters));
    return delay;
}

function pow_encode(n) {
    if ((!Number.isSafeInteger(n)) || n < 0 || n > 9e15) throw (new Error('bad $n.'));

    n = String(n);

    var base = null;
    var exp = null;

    if (n.indexOf('e') === -1) {
        base = Number(n[0]);
        for (let it of n.slice(1)) {
            if (it !== '0') {
                base += 1;
                break;
            }
        }

        exp = n.length - 1;
    } else {
        throw (new Error('bad $n.'));
    }

    if (base > 0xf) throw (new Error('$base is cannot to encoding.'));
    if (exp > 0xf) throw (new Error('$exp is cannot to encoding.'));

    var bin = (new Uint8Array(1));
    {
        let tmp = base.toString(16) + exp.toString(16);
        tmp = parseInt(tmp, 16);
        bin[0] = tmp;
    }

    return bin;
}
function pow_decode(bin) {
    if (bin.constructor !== Uint8Array || bin.length !== 1) throw (new Error('bad $bin.'));

    var base = null;
    var exp = null;
    {
        let tmp = bin[0].toString(16);
        if (tmp.length < 2) tmp = '0' + tmp;

        base = parseInt(tmp[0], 16);
        exp = parseInt(tmp[1], 16);
    }

    //var n = base * (10 ** exp);
    var n = JSON.parse(`${base}e${exp}`);

    return n;
}

async function auto_iters(time) { // millisecond
    if ((!Number.isSafeInteger(time)) || time < 0) throw (new Error('bad $time.'));
    if (time === 0) return 0;

    var iters_min = 1e6;
    var single = 10000;

    var delay = await pbkdf2_time(single);
    delay /= single;

    var iters = ((time * 1.1) / (delay / 1.1));
    iters = Math.floor(iters + 1);
    if (iters < iters_min) iters = iters_min;

    do {
        try {
            iters = pow_encode(iters);
        } catch (err) {
            iters /= 10;
            console.error(err);
            continue;
        }

        break;
    } while (1);

    iters = pow_decode(iters);
    return iters;
}

{
    let time = 10 * 1000;
    let iters = null;

    let get = (async function () {
        if (iters) return iters;
        iters = -1;

        iters = await auto_iters(time);
        console.log(`PBKDF2 iterations: ${iters}, time: ~${time} millisecond.`);

        return (await get_iters());
    });

    var get_iters = (function () {
        return (new Promise((resolve, reject) => {
            var er = (() => {
                get().then((iters) => {
                    if (iters && iters !== -1) {
                        resolve(iters);
                        return;
                    }

                    setTimeout(er, 0);
                });
            });
            setTimeout(er, 0);
        }));
    });
}

{
    let cache = {};
    let cache_index = (async function (input, iters) {
        var input_hash = await sha512(input);
        var iters_hash = await sha512(str2buf(String(iters)));

        var pre_index = buf_concat([input_hash, iters_hash]);
        var index = await sha512(pre_index);

        index = buf2hex(index).toLowerCase();
        return index;
    });

    var pbkdf2 = (async function (input, iters) {
        if ((!Number.isSafeInteger(iters)) || iters <= 0) throw (new Error('bad $iters.'));
        if (input.constructor !== Uint8Array) input = str2buf(input);

        var index = await cache_index(input, iters);
        var output = cache[index];

        if (output) {
            if (output === -1) throw (new Error('please retry at later.'));
            return buf_clone(output);
        }

        cache[index] = -1;
        try {
            let input_hash = await sha512(input);
            input_hash = await crypto.subtle.importKey('raw', input_hash.buffer, 'PBKDF2', false, ['deriveBits']);

            output = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: (new Uint8Array(0)),
                iterations: iters,
                hash: 'SHA-512'
            }, input_hash, 1024);
            output = (new Uint8Array(output));
        } catch (error) {
            cache[index] = undefined;
            throw error;
        }
        cache[index] = output;

        return (await pbkdf2(input, iters));
    });
    var pbkdf2_found = (async function (...args) {
        var index = await cache_index(...args);
        var value = cache[index];

        if (value) {
            if (value === -1) return null;
            return true;
        }

        return false;
    });
}

async function pbkdf2_hint(password, iters) {
    var found = await pbkdf2_found(password, iters);

    if (!found) {
        alert(`正在为此密码生成 Key，由于 PBKDF2 的关系，这可能需要 10 秒钟左右的时间。请耐心等待 (iterations: ${iters}) 。\n生成的 Key 将会被存入缓存。因此，如果密码 和 iterations 相同，将不再需要重复执行此操作以节约时间（直到当前会话结束）。`);
    }
}

var iv_length = null; // byte
{
    // rust range: length_min..=length_max
    let length_min = 16;
    let length_max = 1024;

    inits.push(() => {
        document.getElementById('crypt-iv-range').innerHTML = `${String(length_min).toLowerCase()} ~ ${String(length_max).toLowerCase()}`;
    });

    var iv_length_check = (function (length) {
        if (
            (!length) ||
            (length < length_min || length > length_max)
        ) throw (new Error('bad $iv_length.'));
    });
}

function random(length) {
    if (
        (!Number.isSafeInteger(length)) ||
        length < 0
    ) throw (new Error('bad $length type.'));

    if (length <= 65536) {
        let result = (new Uint8Array(length));
        if (length === 0) return result;

        crypto.getRandomValues(result);
        return result;
    }

    var result = (new Uint8Array(length));
    var offset = 0;

    while (1) {
        let left = (length - offset);
        if (left <= 0) break;

        let size = (left >= 65536 ? 65536 : left);
        let chunk = (new Uint8Array(size));

        crypto.getRandomValues(chunk);
        result.set(chunk, offset);

        offset += size;
    }

    return result;
}

function random_ascii(length) {
    if ((!Number.isSafeInteger(length)) || length < 0) throw (new Error('bad $length.'));
    if (length === 0) return '';

    var result = [];
    for (let i = 0; i < length; ++i) {
        let abc = null;
        do {
            abc = random(1);
        } while (abc[0] < 0x20 || abc[0] > 0x7e); // rust range: 0x20..=0x7e (ASCII)

        abc = buf2str(abc);
        abc = abc[0];

        result.push(abc);
    }
    result = result.join('');

    return result;
}

function random_text(length) {
    if ((!Number.isSafeInteger(length)) || length < 0) throw (new Error('bad $length.'));
    if (length === 0) return '';

    var result = [];
    for (let i = 0; i < length; ++i) {
        let ii = null;
        do {
            ii = random_ascii(1);

            let c = ii.charCodeAt(0);
            if (c >= 0x30 && c <= 0x39) break;
            if (c >= 0x41 && c <= 0x5a) break;
            if (c >= 0x61 && c <= 0x7a) break;
        } while (1);
        result.push(ii);
    }
    result = result.join('');

    return result;
}

function random_alphabet(length) {
    if ((!Number.isSafeInteger(length)) || length < 0) throw (new Error('bad $length.'));
    if (length === 0) return '';

    var result = [];
    for (let i = 0; i < length; ++i) {
        let ii = null;
        do {
            ii = random_text(1);

            let c = ii.charCodeAt(0);
            if (c >= 0x41 && c <= 0x5a) break;
            if (c >= 0x61 && c <= 0x7a) break;
        } while (1);
        result.push(ii);
    }
    result = result.join('');

    return result;
}

function random_number(length) {
    if ((!Number.isSafeInteger(length)) || length < 0) throw (new Error('bad $length.'));
    if (length === 0) return '';

    var result = [];
    for (let i = 0; i < length; ++i) {
        let ii = null;
        do {
            ii = random_text(1);

            let c = ii.charCodeAt(0);
            if (c >= 0x30 && c <= 0x39) break;
        } while (1);
        result.push(ii);
    }
    result = result.join('');

    return result;
}

function random_password(length) {
    var result = null;

    var count = 1000;
    while (1) {
        result = [];

        result.push('#');
        result.push(random_text(length));
        result.push('#');

        result = result.join('');

        try {
            password_checker(result);
        } catch (err) {
            count -= 1;
            if (count < 0) throw err;

            continue;
        }

        break;
    }

    return result;
}

// rust range: min..=max
function urandom_integer(min, max) {
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

function urandom_char() {
    var result = null;

    do {
        result = urandom_integer(0x4e00, 0x9fa5);

        result = result.toString(16);
        if ((result.length % 2) !== 0) result = '0' + result;

        result = `"\\u${result}"`;
        result = JSON.parse(result);
    } while (result.length !== 1);
    return result;
}


{
    let list = (new Set());

    let generate = (() => {
        get_iv_length();
        return random(iv_length);
    });

    var generate_iv = (function () {
        var iv = null;
        var iv_hex = null;
        do {
            iv = generate();
            iv_hex = buf2hex(iv).toLowerCase();
        } while (list.has(iv_hex));
        list.add(iv_hex);
        return iv;
    });
}

// key length is 32 bytes (sha256) forever.
async function aes256ctr_key(password, iv, iters) {
    if (password.constructor !== Uint8Array) password = str2buf(password);

    var password_hash = await pbkdf2(password, iters);

    var tag = await aes256ctr_tag(password_hash, iv);
    var key = await sha256(tag);

    return key;
}

// tag length is 64 bytes (sha512) forever.
// $data is plaintext or password or any binary.
async function aes256ctr_tag(data, iv) {
    if (data.constructor !== Uint8Array) throw (new Error('bad $data type.'));

    if (iv.constructor !== Uint8Array) throw (new Error('bad $iv type.'));
    if (iv.length !== iv_length) throw (new Error('bad $iv length.'));

    var data_hash = await sha512(data);
    var iv_hash = await sha512(iv);

    var pre_tag = buf_concat([data_hash, iv_hash]);
    var tag = await sha512(pre_tag);

    return tag;
}

async function aes256ctr_crypt(input, raw_key) {
    if (input.constructor !== Uint8Array) input = str2buf(input);
    if (raw_key.constructor !== Uint8Array || raw_key.length !== 32) throw (new Error('bad $raw_key.'));

    var key = await crypto.subtle.importKey('raw', raw_key.buffer, 'AES-CTR', false, ['encrypt', 'decrypt']);
    var output = await crypto.subtle.encrypt({
        name: 'AES-CTR',

        counter: (new Uint8Array(16)), // all zero
        length: 128 // counter length (bit)
    }, key, input);
    output = (new Uint8Array(output));

    return output;
}
async function iters_crypt(iters, iv) {
    if (iters.constructor !== Uint8Array) throw (new Error('bad $iters type.'));
    if (iters.length !== 1) throw (new Error('bad $iters length.'));

    if (iv.constructor !== Uint8Array) throw (new Error('bad $iv type.'));
    if (iv.length !== iv_length) throw (new Error('bad $iv length.'));

    var key = await sha256(iv);
    var output = await aes256ctr_crypt(iters, key);
    return output;
}

async function aes256ctr_encrypt(plaintext, password, iv) {
    if (plaintext.constructor !== Uint8Array) plaintext = str2buf(plaintext);

    var tag = await aes256ctr_tag(plaintext, iv);

    var iters = await get_iters();
    var key = await aes256ctr_key(password, iv, iters);

    var input = buf_concat([plaintext, tag]);
    var ciphertext = await aes256ctr_crypt(input, key);

    iters = pow_encode(iters);
    iters = await iters_crypt(iters, iv);

    var encrypted = buf_concat([iters, ciphertext]);
    return encrypted;
}
async function aes256ctr_decrypt(encrypted, password, iv) {
    if (encrypted.constructor !== Uint8Array) throw (new Error('bad $encrypted type.'));

    var iters = encrypted.slice(0, 1);
    if (iters.length !== 1) throw (new Error('bad $iters.'));

    iters = await iters_crypt(iters, iv);
    iters = pow_decode(iters);

    var key = await aes256ctr_key(password, iv, iters);

    var ciphertext = encrypted.slice(1);
    var output = await aes256ctr_crypt(ciphertext, key);
    if (output.length < 64) throw (new Error('bad $output.'));

    var tag_point = output.length - 64;
    if (tag_point < 0) throw (new Error('bad $tag_point.'));

    var tag = output.slice(tag_point);
    if (tag.length !== 64) throw (new Error('bad $tag.'));

    var plaintext = output.slice(0, tag_point);
    var otag = await aes256ctr_tag(plaintext, iv);

    if (!buf_equal(tag, otag)) throw (new Error('verify failed: $tag != $otag.'));
    return plaintext;
}

function aes256ctr_test() {
    var plaintext = `hello world at ${Date.now()}!`;

    var iv = generate_iv();
    var password = '123456';

    console.log('plaintext:', plaintext);
    console.log('password:', password);
    console.log('iv:', iv);

    aes256ctr_encrypt(plaintext, password, iv)
        .then((encrypted) => {
            console.log('encrypted:', encrypted);
            return aes256ctr_decrypt(encrypted, password, iv);
        })
        .then((decrypted) => {
            decrypted = buf2str(decrypted);
            console.log('decrypted:', decrypted);
        });
}

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

        while (first.length < jump) first += array_random(fill);
        output.push(first);
        output.push(half);

        while (second.length < jump) second += array_random(fill);
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

{
    let first = true;
    var get_password_check = (function () {
        var self = document.getElementById('crypt-password-check');
        if (first) {
            document.getElementById('crypt-password-display').checked = false;
            self.checked = true;

            first = false;
        }

        if (password_check && (!self.checked)) {
            let yes = confirm('确定要关闭密码强度检查吗？\n关闭密码强度检查后将无法防止弱密码的使用，弱密码将会对加密的安全性构成威胁。');
            if (!yes) self.click();
        }

        var checked = self.checked;
        password_check = checked;
        return checked;
    });
}

async function get_password() {
    var password = document.getElementById('crypt-password').value;

    get_password_check();

    var password_hint = document.getElementById('crypt-password-hint');
    {
        let error = null;

        try {
            password_checker(password);
        } catch (err) {
            error = err;
        }

        if (error) {
            password_hint.style.display = 'inline';
            if (password_check) throw error;
        } else {
            password_hint.style.display = 'none';
        }
    }

    return password;
}

var password_check = true;
{
    let numbers = {};
    for (let i = 0; i < 10; ++i) {
        numbers[i] = i;
    }

    let letters = {};
    {
        let tmp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toUpperCase();
        for (let i = 0, l = tmp.length; i < l; ++i) {
            let it = tmp[i];
            it = it.toUpperCase();
            letters[it] = i;
        }
    }

    let symbols = '~`!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?'.toUpperCase();
    symbols = symbols.split('');
    symbols = (new Set(symbols));

    var password_checker = (function (password) {
        var len = password.length;

        if ((typeof password) !== 'string')
            throw (new Error('bad $password type.'));

        if (password.length < 10)
            throw (new Error('$password length is < 10.'));

        if (password.toLowerCase() === password)
            throw (new Error('no uppercase character in $password.'));

        if (password.toUpperCase() == password)
            throw (new Error('no lowercase character in $password.'));

        {
            let found = false;
            let keys = (new Set(Object.keys(numbers)));

            for (let it of password) {
                if (keys.has(it)) {
                    found = true;
                    break;
                }
            }

            if (!found) throw (new Error('no number character in $password.'));
        }

        {
            let found = false;
            let keys = (new Set(Object.keys(letters)));

            for (let it of password) {
                it = it.toUpperCase();
                if (keys.has(it)) {
                    found = true;
                    break;
                }
            }

            if (!found) throw (new Error('no alphabet character in $password.'));
        }

        {
            let found = false;
            for (let it of password) {
                it = it.toUpperCase();
                if (symbols.has(it)) {
                    found = true;
                    break;
                }
            }

            if (!found) throw (new Error('no symbol character in $password.'));
        }

        if (password.indexOf(' ') !== -1) throw (new Error('some space is in $password.'));

        for (let i = 0; i < len; ++i) {
            let a = password[i];
            if (!a) continue;

            let b = password[i + 1];
            if (!b) continue;

            if (a.toLowerCase() == b.toLowerCase())
                throw (new Error(`some repeated characters (${JSON.stringify(a)} ${JSON.stringify(b)}) is in $password.`));

            do {
                let an = numbers[a];
                if ((!an) && an !== 0) break;

                let bn = numbers[b];
                if ((!bn) && bn !== 0) break;

                if (an + 1 == bn || an - 1 == bn)
                    throw (new Error(`a number order (${JSON.stringify(a)} ${JSON.stringify(b)}) is in $password.`));
            } while (0);

            do {
                let al = a.toUpperCase();
                al = letters[al];
                if ((!al) && al !== 0) break;

                let bl = b.toUpperCase();
                bl = letters[bl];
                if ((!bl) && bl !== 0) break;

                if (al + 1 == bl || al - 1 == bl)
                    throw (new Error(`a alphabet order (${JSON.stringify(a)} ${JSON.stringify(b)}) is in $password.`));
            } while (0);
        }

        for (let a = 0; a < len; ++a) {
            for (let b = 0; b < len; ++b) {
                let part = password.slice(a, b);
                let other = password.slice(0, a) + password.slice(b);
                if (
                    other.toLowerCase().indexOf(part.toLowerCase()) !== -1 &&
                    other !== part &&
                    (other.length > 1 && part.length > 1)
                ) throw (new Error(`some repeated part (${JSON.stringify(part)}) is in $password.`));
            }
        }
    });
}

function get_input() {
    var id = 'io-input';
    return document.getElementById(id).value;
}
function set_output(data) {
    var id = 'io-output';
    document.getElementById(id).value = data;
}

async function set_status(status) {
    status = status.toLowerCase();

    var self = document.getElementById('io-status');
    switch (status) {
        case 'idle':
            self.innerHTML = 'idle';
            self.style.color = 'gray';
            break;

        case 'working':
            self.innerHTML = 'working';
            self.style.color = 'orange';
            break;

        case 'done':
            self.innerHTML = 'done';
            self.style.color = 'green';
            break;

        case 'failed':
            self.innerHTML = 'failed';
            self.style.color = 'red';
            break;

        default:
            throw (new Error('bad $status.'));
    }

    await later(100);
}

function later(time) {
    return (new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    }));
}

async function _main(type) {
    if (!Number.isSafeInteger(type)) throw (new Error('bad $type type.'));

    if (char.length < base) {
        throw (new Error('字符集不全！需要生成字符集后才能使用。'));
    }

    var crypt_mode = get_crypt_mode();
    var input = str2buf(get_input());

    var output = null;
    switch (type) {
        case 0: // encode
            output = input;
            switch (crypt_mode) {
                case 'none':
                    break;
                case 'aes-256-ctr':
                    get_iv_length();

                    let password = await get_password();
                    let iv = generate_iv();

                    {
                        let iters = await get_iters();
                        await pbkdf2_hint(password, iters);
                    }

                    output = await aes256ctr_encrypt(output, password, iv);
                    output = buf_concat([iv, output]);
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

                    let password = await get_password();

                    if (output.length < iv_length)
                        throw (new Error('bad $output length.'));

                    let iv = output.slice(0, iv_length);
                    output = output.slice(iv_length);

                    {
                        let iters = output.slice(0, 1);
                        iters = await iters_crypt(iters, iv);
                        iters = pow_decode(iters);

                        await pbkdf2_hint(password, iters);
                    }

                    output = await aes256ctr_decrypt(output, password, iv);
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

{
    let ing = false;

    var main = (async function (...args) {
        if (ing) return;

        ing = true;
        await set_status('working');

        var error = null;
        try {
            await _main(...args);
        } catch (err) {
            alert(`${String(err)}\n\n${err.stack}`);
            error = err;
        } finally {
            ing = false;
        }

        if (error) {
            await set_status('failed');
            throw error;
        } else {
            await set_status('done');
        }
    });
}

function test() {
    /* TEST START */

    // Uint8Array()
    {
        Uint8Array.a;
        let tmp = (new Uint8Array());
        tmp[0] = 1;
        tmp[1] = 1;
        tmp = (new Uint8Array(16));
        tmp = (new Uint8Array([1, 2, 3]));
        tmp.length;
    }

    // Set()
    {
        Set.a;
        let tmp = (new Set());
        tmp.add(1);
        tmp.delete(2);
        tmp.clear();
        tmp = (new Set(['a', 'b', 'c']));
        tmp.size;
    }

    // Promise()
    {
        Promise.a;
        let tmp = (new Promise(() => { }));
        tmp.a;
    }

    // crypto
    {
        crypto; crypto.a;
        crypto.subtle; crypto.subtle.a;
    }

    /* TEST SUCCESS */

    var id = 'test';
    document.getElementById(id).style.display = 'none';
}

{
    let called = false;

    var init = (function () {
        if (called) return;
        called = true;

        console.log(`INIT at ${Date.now()}`);

        test();

        get_iters();
        get_password_check();
        get_iv_length();

        base_get();
        table_get();
        display_update();

        window.addEventListener('error', (event) => {
            console.error(event);
            alert(`${event.message}\n\n${event.error ? event.error.stack : ''}`);
        });
    });
}
inits.push(init);

if ((typeof document) !== 'undefined') {
    let called = false;
    document.addEventListener('DOMContentLoaded', (event) => {
        if (called) return;
        called = true;

        for (let it of inits) {
            it();
        }
    });
} else {
    throw (new Error('$document is undefined. this script is can running at a browser only.'));
}

