all:
	false

update:
	git add -A
	git status
	git checkout dev

pull:
	make update
	
	git checkout master
	git pull origin master
	git pull origin --tags
	
	git checkout dev
	git pull origin dev
	
	make update

push:
	make pull
	
	git checkout dev
	git push origin dev
	
	make update

publish:
	make pull
	
	git checkout master
	git push origin master
	git push origin --tags
	
	make update

run:
	python3 -c 'import webbrowser;raise SystemExit(0 if webbrowser.open("./index.html") else 1)'

