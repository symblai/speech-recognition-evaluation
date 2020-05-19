const processByLine = (content = '', lineMapper = line => line, concatenateLinesUsing = '\n') => {
    return splitByNewLines(content)
        .filter(line => line && line.length > 0)
        .map(line => lineMapper(line))
        .reduce((previousValue, currentValue) => {
            if (previousValue) {
                return previousValue + concatenateLinesUsing + currentValue;
            }
            return currentValue;
        }, '');
};

const removeSpeakerStarters = (content = '') => {
    return processByLine(content, line => line.replace(/^(.*:[\s*])+/, '').trim());
};

const removeAnnotations = (content = '') => {
    return processByLine(content, line => line.replace(/(\[(?:\[??[^\[]*?]))+/gi, '').trim());
};

const removeExtraWhiteSpaces = (content = '') => {
    return processByLine(content, line => line.replace(/(\s)+/gi, ' ').trim());
};

const removeQuotes = (content = '') => {
    return processByLine(content, line => line.replace(/(")+/gi, '').trim());
};

const removeDashes = (content = '') => {
    return processByLine(content, line => line.replace(/(-)+/gi, '').trim());
};

const removePunctuations = (content = '') => {
    return processByLine(content,
            line => line.replace(/([.?!]$|[,;])+/gi, '').trim()
        .replace(/((\.\s+)|(\?\s+)|(!\s+))+/gi, ' ')
    );
};

const defaultNormalizationOptions = {
    removeSpeakerStarters: true,
    removeAnnotations: true,
    removeExtraWhiteSpaces: true,
    removeQuotes: true,
    removeDashes: true,
    removePunctuations: true,
    lowerCase: true,
};

const normalize = (content = '', options = {}) => {
    const _options = {...defaultNormalizationOptions, ...options};
    let _content = content;
    if (_options.removeSpeakerStarters) {
        _content = removeSpeakerStarters(_content);
    }
    if (_options.removeAnnotations) {
        _content = removeAnnotations(_content);
    }

    if (_options.removeExtraWhiteSpaces) {
        _content = removeExtraWhiteSpaces(_content);
    }

    if (_options.removeQuotes) {
        _content = removeQuotes(_content);
    }

    if (_options.removeDashes) {
        _content = removeDashes(_content);
    }

    if (_options.removePunctuations) {
        _content = removePunctuations(_content);
    }

    if (_options.lowerCase) {
        _content = _content.toLowerCase();
    }

    return _content;
};

const collateToSingleLine = (content = '') => {
    return processByLine(content, undefined, ' ');
};

const splitByWords = (text = '') => {
    if (!text) {
        return [];
    }
    // split string by spaces (including spaces, tabs, and newlines)
    return text.split(/\s+/);
};

const totalWords = (text = '') => {
    return splitByWords(text).length;
};

const splitByNewLines = (text) => {
    if (!text) {
        return [];
    }
    return text.split(/\n+/);
};

const totalNewLines = (text = '') => {
    return splitByNewLines(text).length;
};

module.exports = {
    normalize,
    totalWords,
    totalNewLines,
    splitByNewLines,
    splitByWords,
    collateToSingleLine
};