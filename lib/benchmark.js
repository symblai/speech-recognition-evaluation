const fs = require('fs');

const jsdiff = require('diff');
require('colors');

const {levenshteinDistance} = require('./distance');
const {totalWords, totalNewLines, normalize, collateToSingleLine} = require('./utils');

const validateNonEmpty = (groundTruth, predicted) => {
    if (!groundTruth && !predicted) {
        throw `'groundTruth' or 'predicted' cannot be empty.`;
    }
};

const wordErrorRate = (groundTruth, predicted, distance =  -1) => {
    let _distance = distance;
    if (_distance <= -1) {
        _distance = levenshteinDistance(groundTruth, predicted).distance;
    }
    return _distance / Math.max(groundTruth.split(" ").length, predicted.split(" ").length);
};

const calculateDistance = (groundTruth = '', predicted = '') => {
    validateNonEmpty(groundTruth, predicted);
    return levenshteinDistance(groundTruth, predicted);
};

const calculateWER = (groundTruth = '', predicted = '', distance) => {
    validateNonEmpty(groundTruth, predicted);
    return wordErrorRate(groundTruth, predicted, distance);
};

const calculateDiff = (groundTruth, predicted) => {
    return jsdiff.diffWords(groundTruth, predicted);
};

const wordInformationLoss = (groundTruth, predicted, distance =  -1) => {
    let _distance = distance;
    if (_distance <= -1) {
        _distance = levenshteinDistance(groundTruth, predicted).distance;
    }
    const diff = calculateDiff(groundTruth, predicted);
    const diffPairs = calculateDiffPairs(diff);
    
    return 1.0 - (  (diffPais.pairs.length() / (groundTruth.split(" ").length + diffPairs.insertions.length() ) ) * ( diffPais.pairs.length() / predicted.split(" ").length ) );
};

const calculateWIL = (groundTruth = '', predicted = '', distance) => {
    validateNonEmpty(groundTruth, predicted);
    return wordInformationLoss(groundTruth, predicted, distance);
};

const calculateDiffPairs = (diff) => {
    let diffs = {
        insertions: [],
        deletions: [],
        pairs: []
    };

    diff.forEach((part, index, arr) => {
        if (part.added) {
            diffs.insertions.push(part.value);
        } else if (part.removed) {
            diffs.deletions.push(part.value);
        }

        if (index >= 1) {
            if (arr[index - 1].removed && part.added) {
                const pair = {
                    original: arr[index - 1].value.trim(),
                    predicted: part.value.trim(),
                    type: 'mismatched'
                };
                if (pair.original && pair.predicted) {
                    diffs.pairs.push(pair);
                }
            } else if (part.removed && !arr[index - 1].removed && index < arr.length - 1 && !arr[index + 1].added) {
                const pair = {
                    original: part.value.trim(),
                    predicted: '',
                    type: 'deleted'
                };
                if (pair.original) {
                    diffs.pairs.push(pair);
                }
            } else if (part.added && !arr[index - 1].removed) {
                const pair = {
                    original: '',
                    predicted: part.value.trim(),
                    type: 'inserted'
                };
                if (pair.predicted) {
                    diffs.pairs.push(pair);
                }
            }
        }


    });
    return diffs;
};

const calculate = (groundTruth = '', predicted = '', options = {}) => {
    validateNonEmpty(groundTruth, predicted);
    const normalizedGroundTruth = collateToSingleLine(normalize(groundTruth, options));
    const normalizedPredicted = collateToSingleLine(normalize(predicted, options));

    const {distance, groundTruthWords, predictedWords} = calculateDistance(normalizedGroundTruth, normalizedPredicted);
    const wer = calculateWER(normalizedGroundTruth, predicted, distance);
    const wil = calculateWIL(normalizedGroundTruth, predicted, distance);

    const diff = calculateDiff(normalizedGroundTruth, normalizedPredicted);
    const diffPairs = calculateDiffPairs(diff);

    return {
        stats: {
            groundTruth: {
                characters: groundTruth.length,
                words: totalWords(groundTruth),
                newLines: totalNewLines(groundTruth),
                normalized: {
                    characters: normalizedGroundTruth.length,
                    words: groundTruthWords.length,
                    newLines: totalNewLines(normalizedGroundTruth)
                }
            },
            predicted: {
                characters: predicted.length,
                words: totalWords(predicted),
                newLines: totalNewLines(predicted),
                normalized: {
                    characters: normalizedPredicted.length,
                    words: predictedWords.length,
                    newLines: totalNewLines(normalizedPredicted)
                }
            },
            words: {
                insertions: diffPairs.pairs.filter(pair => pair.type === 'inserted')
                    .map(pair => totalWords(pair.predicted))
                    .reduce((previousValue, currentValue) => previousValue + currentValue, 0),
                deletions: diffPairs.pairs.filter(pair => pair.type === 'deleted')
                    .map(pair => totalWords(pair.original))
                    .reduce((previousValue, currentValue) => previousValue + currentValue, 0),
                mismatches: diffPairs.pairs.filter(pair => pair.type === 'mismatched')
                    .map(pair => totalWords(pair.original))
                    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
            },
            phrases: {
                insertions: diffPairs.pairs.filter(pair => pair.type === 'inserted').length,
                deletions: diffPairs.pairs.filter(pair => pair.type === 'deleted').length,
                mismatches: diffPairs.pairs.filter(pair => pair.type === 'mismatched').length
            }
        },
        wer,
        wil,
        distance,
        diffPairs: diffPairs.pairs,
        totalDiffPairs: diffPairs.pairs.length,
        diff
    };
};

const calculateFromFile = (groundTruthFile = '', predictedFile = '', options = {}) => {
    const groundTruthBuffer = fs.readFileSync(groundTruthFile);
    const predictedBuffer = fs.readFileSync(predictedFile);

    const groundTruth = groundTruthBuffer.toString('utf-8');
    const predicted = predictedBuffer.toString('utf-8');

    validateNonEmpty(groundTruth, predicted);

    const result = calculate(groundTruth, predicted, options);

    result.stats.groundTruth = {bytes: groundTruthBuffer.byteLength, ...result.stats.groundTruth};
    result.stats.predicted = {bytes: predictedBuffer.byteLength, ...result.stats.predicted};

    return result;
};

const printResult = (result, options = {}) => {
    const defaultOptions = {
        wer: true,
        wil:true,
        distance: false,
        stats: false,
        diffPairs: false,
        textComparison: false
    };

    const _options = {...defaultOptions, ...options};

    if (_options.wer) {
        console.log(`Word Error Rate (WER): ${result.wer * 100}%\n`);
    }
    
    if (_options.wil) {
        console.log(`Word Information Loss (WIL): ${result.wil * 100}%\n`);
    }

    if (_options.distance) {
        console.log(`Distance: ${result.distance}\n`);
    }

    if (_options.stats) {
        console.log(`Stats: ${JSON.stringify(result.stats, undefined, 2)}\n`);
    }

    if (_options.diffPairs) {
        console.log(`Diff Pairs: ${JSON.stringify(result.diffPairs, undefined, 2)}\n`)
    }

    if (_options.textComparison) {
        console.log('Text Comparison: \n\n');
        result.diff.forEach(part => {
            const color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            process.stderr.write(part.value[color]);
        });
        process.stderr.write('\n');
    }
};

// /Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session-groundtruth.txt
// /Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session-groundtruth-pass2.txt


// /Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session.wav.cognitiveservice.txt
// /Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session.wav.google.enhanced.txt

// const result = calculateFromFile('/Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session-groundtruth-pass2.txt',
//     '/Users/toshish/Library/Preferences/IntelliJIdea2019.3/scratches/microsoft-transcription/Developer_Advocacy_Working_Session.wav.cognitiveservice.txt',
//     {});
//
// console.log(JSON.stringify(result, null, 2));

module.exports = {
    calculateFromFile,
    printResult
};
