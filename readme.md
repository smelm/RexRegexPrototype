
# Demo

To run the demo you need to have nodejs installed on your system (or run it inside a docker container). 


## Email Example

```sh
npm install
npm run demo
```

## Run Inference from Examples

To run the code generation from the already created inference output, just run:

```
npm run from-infer
```

To actually run the inference you need to clone the repository containing the java code (forked from the original paper). 

```
git clone https://github.com/smelm/RegexGenerator.git
cd RegexGenerator
```

To run the inference on their example you can simply run:

```
./gradlew run     (Linux)
gradlew.bat run   (Windows)
```

To create the DSL code from the output run:

```
npm run from-infer -- RegexGenerator/ConsoleRegexTurtle/generated.json
```

To create your own examples refer to the documentation in that repo or the original paper.



