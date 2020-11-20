# Automatic Speech Recognition (ASR) Evaluation

If you're using any Speech-to-Text or Speech Recognition engine to generate transcriptions from your audio/video content, then you can use this tool to compare how well it is doing against a human generated transcription. If you're not sure how to generate transcription, you can take a look [here](https://docs.symbl.ai/#how-tos) for list of tutorials to help you get started.

## What can this utility do?
This is a simple utility to perform a quick evaluation on the results generated by any Speech to text (STT) or Automatic Speech Recognition (ASR) System.

This utility can calculate following metrics -
* [Word Error Rate (WER)](https://en.wikipedia.org/wiki/Word_error_rate), which is a most common metric of measuring the performance of a Speech Recognition or Machine translation system
* [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance) calculated at word level.
* Number of Word level insertions, deletions and mismatches between the original file and the generated file.
* Number of Phrase level insertions, deletions and mismatches between the original file and the generated file.
* Color Highlighted text Comparison to visualize the differences.
* General Statistics about the original and generated files (bytes, characters, words, new lines etc.)

The utility also performs the pre-processing or normalization of the text in the provided files based on following operations -
* Remove Speaker Name: Remove Speaker name at the beginning of the line.
* Remove Annotations: Remove any custom annotations added during transcriptions.
* Remove Whitespaces: Remove any extra white spaces.
* Remove Quotes: Remove any double quotes
* Remove Dashes: Remove any dashes
* Remove Punctuations: Remove any punctuations (.,?!)
* Convert contents to lower case

## Pre-requisites
Make sure that you have [NodeJS v8+](https://nodejs.org/en/download/) installed on your system.

## Installation
```bash
npm install -g speech-recognition-evaluation
```
Verify installation by simply running:
```bash
asr-eval
```

## Usage
Simplest way to run your first evaluation is by simply passing `original` and `generated` options to `asr-eval` command.
Where, `original` is a plain text file containing original transcript to be used as reference; usually this is generated by human beings.
And `generated` is a plain text file containing generated transcript by the STT/ASR system.

```bash
asr-eval --original ./original-file.txt --generated ./generated-file.txt
```

This would print simply the Word Error Rate (WER) between the provided files. This is how the output should look like:
```
Word Error Rate (WER): 13.61350109561817%
```

To find more information about all the available options:
```bash
asr-eval --help
```
All the available usage options would be printed:
```
Synopsis

  $ asr-eval --original file --generated file           
  $ asr-eval [options] --original file --generated file 
  $ asr-eval --help                                     

Options

  -o, --original file         Original File to be used as reference. Usually, this should be the            
                              transcribed file by a Human being.                                            
  -g, --generated file        File with the output generated by Speech Recognition System.                  
  -e, --wer                   Default: true. Print Word Error Rate (WER).                                   
  --distance                  Default: false. Print total word distance after comparison.                   
  -e, --stats                 Default: false. Print statistics about original and generate files, before    
                              and after pre-processing. Also prints statistics about word level and phrase  
                              level differences.                                                            
  --pairs                     Default: false. Print all the difference pairs with type of difference.       
  -c, --textcomparison        Default: false. Print the text comparison between two files with              
                              highlighting.                                                                 
  -s, --removespeakers        Default: true. Remove the speaker at the start of each line in files before   
                              calculations. The speaker should be separated by colon ":" i.e. speaker_name: 
                              text For e.g. "John Doe: Hello, I am John." would get converted to simply     
                              "Hello, I am John."                                                           
  -a, --removeannotations     Default: true. Remove any custom annotations in the transcript before         
                              calculations. This is useful when removing custom annotations done by human   
                              transcribers.  Anything in square brackets [] are detected as annotations.    
                              For e.g. "Hello, I am [inaudible 00:12] because of few reasons." would get    
                              converted to "Hello, I am because of few reasons."                            
  -w, --removewhitespaces     Default: true. Remove any extra white spaces before calculations.             
  -q, --removequotes          Default: true. Remove any double quotes '"' from the files before             
                              calculations.                                                                 
  -d, --removedashes          Default: true. Remove any dashes (hyphens) "-" from the files before          
                              calculations.                                                                 
  -p, --removepunctuations    Default: true. Remove any punctuations ".,?!" from the files before           
                              calculations.                                                                 
  -l, --lowercase             Default: true. Convert both files to lower case before calculations. This is  
                              useful if evaluation needs to be done in case-insensitive way.                
  -h, --help                  Print this usage guide.                              
```

## Getting help
If you need help installing or using the utility, please give a shout out in our [slack channel](https://symbldotai.slack.com/join/shared_invite/zt-4sic2s11-D3x496pll8UHSJ89cm78CA)

If you've instead found a bug or would like new features added, go ahead and open issues or pull requests against this repo!
