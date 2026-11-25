# Native build runs the tests; the wasm build produces the module the web app
# loads. Both come from the same header, so a test failure blocks both.

CXXFLAGS := -std=c++20 -O2 -Wall -Wextra -Wpedantic
BUILD    := build
WEB_OUT  := ../public/engine

.PHONY: test clean wasm

test: $(BUILD)/test_order_book
	@./$(BUILD)/test_order_book

$(BUILD)/test_order_book: tests/test_order_book.cpp src/order_book.hpp
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) tests/test_order_book.cpp -o $@

wasm: src/bindings.cpp src/order_book.hpp
	@mkdir -p $(WEB_OUT)
	em++ src/bindings.cpp -o $(WEB_OUT)/order_book.js \
		-std=c++20 -O3 \
		-lembind \
		-s MODULARIZE=1 \
		-s EXPORT_ES6=1 \
		-s ENVIRONMENT=web \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s EXPORT_NAME=createOrderBookModule

clean:
	rm -rf $(BUILD) $(WEB_OUT)
