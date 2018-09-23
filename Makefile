bench: node_modules small-files
	node bench

node_modules:
	npm install bluebird

small-files:
	mkdir -p small-files
	for i in $$(seq 1 20000); do \
		echo This is file $$i > small-files/$$i.txt; \
	done

.PHONY: bench
