bench: setup
	node bench

setup: node_modules
	rm -rf small-files
	mkdir small-files
	for i in $$(seq 1 $(FILES)); do \
		echo This is file $$i > small-files/$$i.txt; \
	done

node_modules:
	npm install bluebird

.PHONY: bench setup
