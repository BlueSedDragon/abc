update:
	git add -A
	git status

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
	
	git checkout master
	git push origin master
	git push origin --tags
	
	make update


