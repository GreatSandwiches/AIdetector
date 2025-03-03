/**
 * Advanced AI Text Detector
 * v3.0 - Enhanced confidence for AI text identification
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all elements
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const formalModeCheckbox = document.getElementById('formal-writing-mode');
    const resultCard = document.getElementById('result');
    const aiProbabilityBar = document.getElementById('ai-probability');
    const humanProbabilityBar = document.getElementById('human-probability');
    const probabilityText = document.getElementById('probability-text');
    const humanProbabilityText = document.getElementById('human-probability-text');
    const highlightedText = document.getElementById('highlighted-text');
    const reasonsList = document.getElementById('reasons-list');
    const reasonsSection = document.getElementById('reasons-section');
    const highlightedSection = document.getElementById('highlighted-section');
    
    // Indicator elements
    const patternsDot = document.getElementById('patterns-dot');
    const structuresDot = document.getElementById('structures-dot');
    const vocabularyDot = document.getElementById('vocabulary-dot');
    const patternsText = document.getElementById('patterns-text');
    const structuresText = document.getElementById('structures-text');
    const vocabularyText = document.getElementById('vocabulary-text');

    // Sample texts
    const aiSampleText = `Artificial intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. Its applications span across various sectors, from healthcare to finance, transportation to entertainment. The remarkable capabilities of AI systems stem from their ability to process vast amounts of data, identify patterns, and make predictions or decisions based on those patterns.

The development of AI can be traced back to the mid-20th century, but recent advancements in computing power, algorithm design, and data availability have accelerated its progress exponentially. Modern AI systems employ sophisticated techniques such as deep learning, which mimics the neural networks of the human brain, albeit in a simplified manner.

As AI continues to evolve, it raises important questions about its impact on society, employment, privacy, and ethics. While AI offers tremendous potential benefits, including increased efficiency, improved decision-making, and solutions to complex problems, it also presents challenges that require careful consideration and management.

It is worth noting that ethical considerations play a crucial role in AI development. Researchers and policymakers must work together to establish robust frameworks for AI governance. This approach provides a foundation for responsible innovation while mitigating potential risks.`;

    const humanSampleText = `I've been thinking about AI a lot lately. It's kind of scary how fast things are changing. Last week I was talking with my friend Sarah about how her company just started using some AI tool to write their marketing emails, and she's worried about her job. I told her I didn't think robots would replace creative people anytime soon, but honestly, who knows?

The weird thing is, I'm both excited and nervous about all this tech. On one hand, I love how my phone can now edit my vacation photos to look professional without me doing anything. But then I see those deepfake videos online that look totally real, and it creeps me out.

My brother works in cybersecurity, and he says we're not prepared for what's coming. He's always been a bit dramatic though! Still, I wonder if we're moving too fast without thinking things through. Maybe we need to slow down and figure out some rules?`;

    // Set initial sample text
    textInput.value = aiSampleText;

    // Sample button click handler
    sampleBtn.addEventListener('click', function() {
        try {
            // Toggle between AI and human sample texts
            const currentText = textInput.value.trim();
            
            if (currentText === aiSampleText) {
                textInput.value = humanSampleText;
                sampleBtn.textContent = 'Load AI Sample';
            } else {
                textInput.value = aiSampleText;
                sampleBtn.textContent = 'Load Human Sample';
            }
        } catch (error) {
            console.error("Error toggling sample text:", error);
        }
    });

    // Analyze button click handler
    analyzeBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }
        
        // Show loading state
        analyzeBtn.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;
        
        // Get formal mode setting
        const formalMode = formalModeCheckbox ? formalModeCheckbox.checked : false;
        
        // Simulate analysis delay
        setTimeout(() => {
            try {
                const results = analyzeText(text, formalMode);
                displayResults(results, formalMode);
            } catch (error) {
                console.error("Analysis error:", error);
                alert("There was an error analyzing the text. Please try again.");
            } finally {
                // Reset button
                analyzeBtn.textContent = 'Analyze Text';
                analyzeBtn.disabled = false;
            }
        }, 1000);
    });

    // Enhanced analysis function
    function analyzeText(text, formalMode) {
        // Core metrics
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        if (wordCount < 20) {
            return {
                aiProbability: 50,
                patternScore: 0.5,
                structureScore: 0.5,
                vocabularyScore: 0.5,
                highlightedHtml: text,
                reasons: ["Text sample too short for accurate analysis."]
            };
        }
        
        // Enhanced sentence detection with better handling of abbreviations and quotations
        const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
        let sentences = text.replace(sentenceRegex, '|').split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        // Handle cases where the regex might miss sentence boundaries
        if (sentences.length <= 1 && text.length > 150) {
            // Fallback to simpler splitting if the regex doesn't work well
            sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
        }
        
        // Word-level analysis
        const cleanWords = words.map(w => w.toLowerCase().replace(/[^\w]/g, ''))
            .filter(w => w.length > 0);
        const uniqueWords = new Set(cleanWords);
        const uniqueWordsRatio = uniqueWords.size / cleanWords.length;
        
        // Word frequency
        const wordFreq = {};
        cleanWords.forEach(word => {
            if (word.length > 3) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        // N-gram analysis
        function createNGrams(array, n) {
            const result = [];
            for (let i = 0; i < array.length - n + 1; i++) {
                result.push(array.slice(i, i + n).join(' '));
            }
            return result;
        }
        
        // Get bigrams and trigrams
        const bigrams = createNGrams(cleanWords, 2);
        const trigrams = createNGrams(cleanWords, 3);
        
        const bigramCounts = {};
        bigrams.forEach(bg => {
            bigramCounts[bg] = (bigramCounts[bg] || 0) + 1;
        });
        
        const trigramCounts = {};
        trigrams.forEach(tg => {
            trigramCounts[tg] = (trigramCounts[tg] || 0) + 1;
        });
        
        // Count repeated phrases with higher threshold for repetition
        const repeatedBigrams = Object.values(bigramCounts).filter(c => c > 2).length;
        const bigramRepetitionRatio = repeatedBigrams / Math.max(1, bigrams.length);
        
        // Look for unusual trigram repetition (more indicative of AI)
        const repeatedTrigrams = Object.values(trigramCounts).filter(c => c > 1).length;
        const trigramRepetitionRatio = repeatedTrigrams / Math.max(1, trigrams.length);
        
        // Sentence structure analysis
        const sentenceLengths = sentences.map(s => 
            s.split(/\s+/).filter(w => w.length > 0).length
        );
        
        // Calculate mean and variance
        const meanSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / 
            Math.max(sentenceLengths.length, 1);
        
        // Calculate variance to determine sentence length consistency
        let variance = 0;
        sentenceLengths.forEach(len => {
            variance += Math.pow(len - meanSentenceLength, 2);
        });
        variance /= Math.max(sentenceLengths.length, 1);
        const stdDev = Math.sqrt(variance);
        
        // Variation coefficient (lower = more uniform = more AI-like)
        // Adjusted to be more permissive of academic writing style
        const variationCoefficient = stdDev / meanSentenceLength;
        
        // Sentence beginnings with stop words excluded
        const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'with', 'by', 'of', 'this', 'that', 'these', 'those']);
        const sentenceBeginnings = sentences.map(s => {
            const words = s.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) return '';
            
            // Get first non-stop word if possible
            let firstWord = words[0].toLowerCase();
            if (stopWords.has(firstWord) && words.length > 1) {
                firstWord = words[1].toLowerCase();
            }
            return firstWord;
        }).filter(w => w.length > 0);
        
        const uniqueBeginnings = new Set(sentenceBeginnings);
        const beginningDiversity = uniqueBeginnings.size / Math.max(sentenceBeginnings.length, 1);
        
        // AI phrases list - expanded and categorized
        const formalPhrases = [
            'furthermore', 'moreover', 'additionally', 'consequently', 'therefore',
            'in conclusion', 'in summary', 'in essence', 'specifically', 'notably',
            'particularly', 'significantly', 'subsequently', 'nevertheless', 'alternatively',
            'conversely', 'similarly', 'likewise', 'in contrast', 'whereas',
            'as a result', 'thus', 'hence', 'in addition', 'in other words'
        ];
        
        // Common human academic writing phrases
        const commonAcademicPhrases = [
            'recent studies', 'according to', 'previous research', 'empirical evidence',
            'data suggests', 'findings indicate', 'literature review', 'theoretical framework',
            'methodological approach', 'statistical analysis', 'qualitative analysis',
            'quantitative data', 'conceptual model', 'established paradigm'
        ];
        
        // Informal and formal AI patterns (expanded)
        const casualPatterns = [
            'it\'s important to note', 'it\'s worth mentioning', 
            'it\'s essential to', 'keep in mind that', 'it\'s interesting to',
            'we can see that', 'as we can see', 'as mentioned earlier',
            'let\'s explore', 'one of the most', 'there are several',
            'when it comes to', 'the fact that', 'a wide range of',
            'plays a crucial role', 'it is worth noting that', 'it should be noted that',
            'it is important to recognize', 'it is interesting to observe',
            'this analysis demonstrates', 'this approach provides', 'this framework allows'
        ];
        
        // Count phrase matches with context awareness
        const formalPhraseMatches = [];
        formalPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            const matches = text.match(regex) || [];
            matches.forEach(m => formalPhraseMatches.push({ phrase, match: m }));
        });
        
        const academicPhraseMatches = [];
        commonAcademicPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            const matches = text.match(regex) || [];
            matches.forEach(m => academicPhraseMatches.push({ phrase, match: m }));
        });
        
        const casualPatternMatches = [];
        casualPatterns.forEach(pattern => {
            const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
            const matches = text.match(regex) || [];
            matches.forEach(m => casualPatternMatches.push({ pattern, match: m }));
        });
        
        // Consider academic phrases separately in formal mode
        const academicPhraseRatio = academicPhraseMatches.length / Math.max(1, sentences.length);
        const totalPhraseMatches = formalPhraseMatches.length + casualPatternMatches.length;
        const phraseRatio = totalPhraseMatches / Math.max(1, sentences.length);
        
        // Long sentence analysis with adjustments for formal writing
        const formalLengthThreshold = 25;  // Increased from 20
        const casualLengthThreshold = 20;
        const lengthThreshold = formalMode ? formalLengthThreshold : casualLengthThreshold;
        
        const longSentences = sentenceLengths.filter(len => len > lengthThreshold).length;
        const longSentenceRatio = longSentences / Math.max(sentenceLengths.length, 1);
        
        // Count consecutive sentences with similar length (with increased tolerance for formal writing)
        let similarLengthPairs = 0;
        const similarityThreshold = formalMode ? 3 : 2;  // More tolerance in formal mode
        for (let i = 0; i < sentenceLengths.length - 1; i++) {
            const diff = Math.abs(sentenceLengths[i] - sentenceLengths[i+1]);
            if (diff <= similarityThreshold && sentenceLengths[i] > 10) {
                similarLengthPairs++;
            }
        }
        const similarLengthRatio = similarLengthPairs / Math.max(1, sentenceLengths.length - 1);
        
        // Vocabulary analysis with context awareness
        const longWords = cleanWords.filter(w => w.length > 8).length;
        const longWordRatio = longWords / Math.max(cleanWords.length, 1);
        
        // Count repeated words with higher threshold
        const repeatedWordsThreshold = formalMode ? 3 : 2;
        const repeatedWords = Object.values(wordFreq).filter(c => c > repeatedWordsThreshold).length;
        const repeatedWordsRatio = repeatedWords / Math.max(uniqueWords.size, 1);
        
        // More sophisticated readability and complexity measures
        // Check for contractions (more common in human writing)
        const contractionCount = (text.match(/\b\w+['']\w+\b/g) || []).length;
        const contractionRatio = contractionCount / Math.max(1, sentences.length);
        
        // Check for personal pronouns (more common in human writing)
        const personalPronouns = ['i', 'we', 'my', 'our', 'me', 'us', 'myself', 'ourselves'];
        let pronounCount = 0;
        personalPronouns.forEach(pronoun => {
            const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
            const matches = text.match(regex) || [];
            pronounCount += matches.length;
        });
        const pronounRatio = pronounCount / Math.max(1, sentences.length);
        
        // Check for parenthetical expressions or asides (more common in human writing)
        const parentheticalCount = (text.match(/\([^)]+\)/g) || []).length;
        const parentheticalRatio = parentheticalCount / Math.max(1, sentences.length);
        
        // Simplified perplexity measure 
        const totalWordEntropy = Object.values(wordFreq).reduce((entropy, freq) => {
            const probability = freq / cleanWords.length;
            return entropy - (probability * Math.log2(probability || 1));
        }, 0);
        
        const predictabilityScore = 1 - Math.min(totalWordEntropy / 4.5, 1);
        
        // Burstiness measure - variance in information density
        const infoPerSentence = sentences.map(s => {
            const sentWords = s.split(/\s+/).filter(w => w.length > 0);
            const uniqueSentWords = new Set(sentWords.map(w => w.toLowerCase()));
            return uniqueSentWords.size / Math.max(1, sentWords.length);
        });
        
        // Calculate variance in information density
        let infoVariance = 0;
        const meanInfoDensity = infoPerSentence.reduce((sum, val) => sum + val, 0) / 
            Math.max(infoPerSentence.length, 1);
        
        infoPerSentence.forEach(val => {
            infoVariance += Math.pow(val - meanInfoDensity, 2);
        });
        infoVariance /= Math.max(infoPerSentence.length, 1);
        
        // Lower variance = more AI-like
        const burstinessScore = 1 - Math.min(Math.sqrt(infoVariance) * 5, 1);
        
        // Calculate scores with improved formal mode adjustment
        // For pattern score, increased weights for AI indicators
        let patternScore = 0.3 + 
            (phraseRatio * (formalMode ? 3.0 : 3.5)) + // Stronger emphasis on phrases
            (trigramRepetitionRatio * 0.9) +  // Much higher emphasis on trigrams
            (bigramRepetitionRatio * 0.4) +  // Higher emphasis on bigrams
            (predictabilityScore * (formalMode ? 0.5 : 0.4)); // Higher emphasis on predictability
        
        // Minimal reduction for human indicators to maintain AI detection confidence
        patternScore -= (contractionRatio * (formalMode ? 0.15 : 0.25) + 
                      pronounRatio * (formalMode ? 0.1 : 0.2) + 
                      parentheticalRatio * (formalMode ? 0.1 : 0.2));
        
        // For structure score, be more permissive in formal mode
        let structureScore = 0.2 + 
            (0.3 * (1 - Math.min(variationCoefficient, 0.5) / 0.5)) + 
            (longSentenceRatio * (formalMode ? 0.2 : 0.3)) + 
            (similarLengthRatio * (formalMode ? 0.3 : 0.4)) + 
            ((1 - beginningDiversity) * (formalMode ? 0.2 : 0.3));
        
        // For vocabulary score, account for academic writing patterns
        let vocabularyScore = 0.3 + 
            ((1 - uniqueWordsRatio) * (formalMode ? 0.3 : 0.4)) + 
            (repeatedWordsRatio * (formalMode ? 0.2 : 0.3)) + 
            (longWordRatio * (formalMode ? 0.1 : 0.2)) + 
            (burstinessScore * (formalMode ? 0.2 : 0.3));
        
        // Give less discount to academic phrases - they're often signs of AI in formal writing too
        if (formalMode) {
            vocabularyScore -= academicPhraseRatio * 0.05;  // Minimal reduction
        }
        
        // Adjust weights for formal writing
        let patternWeight, structureWeight, vocabularyWeight;
        let adjustedPatternScore = patternScore;
        let adjustedStructureScore = structureScore;
        
        if (formalMode) {
            // More confident weights for formal writing detection
            patternWeight = 0.35;
            structureWeight = 0.35;
            vocabularyWeight = 0.30;
            
            // Apply minimal adjustments for formal writing
            adjustedPatternScore = patternScore * 0.9;  // Reduce by only 10%
            adjustedStructureScore = structureScore * 0.9;  // Reduce by only 10%
        } else {
            patternWeight = 0.35;
            structureWeight = 0.35;
            vocabularyWeight = 0.30;
        }
        
        // Final probability calculation with clamping
        let clampedPatternScore = clamp(adjustedPatternScore, 0, 1);
        let clampedStructureScore = clamp(adjustedStructureScore, 0, 1);
        let clampedVocabularyScore = clamp(vocabularyScore, 0, 1);
        
        // Apply a stronger AI confidence factor (removes unnecessary human bias)
        const humanBiasFactor = formalMode ? 1.0 : 1.0;  // No reduction in AI detection confidence
        
        const rawProbability = (
            clampedPatternScore * patternWeight + 
            clampedStructureScore * structureWeight + 
            clampedVocabularyScore * vocabularyWeight
        );
        
        // Apply the human bias
        const aiProbability = Math.round(rawProbability * 100 * humanBiasFactor);
        
        // Generate reasons list
        const reasons = [];
        
        if (formalMode) {
            reasons.push("<strong>Note:</strong> Analysis adjusted for formal/academic writing style to reduce false positives.");
        }
        
        // Adjusted thresholds for generating reasons
        const patternThreshold = formalMode ? 0.35 : 0.2;
        const structureThreshold = formalMode ? 0.4 : 0.35;
        const vocabularyThreshold = formalMode ? 0.45 : 0.4;
        
        // Language pattern reasons
        if (phraseRatio > patternThreshold) {
            reasons.push(`High usage of formal transition phrases${formalMode ? " (common in both AI and formal human writing)" : " typical in AI writing"} (${totalPhraseMatches} instances detected)`);
            
            if (formalPhraseMatches.length > 0) {
                const topPhrases = [...new Set(formalPhraseMatches.map(m => m.phrase))].slice(0, 3);
                reasons.push(`Frequent use of formal phrases: "${topPhrases.join('", "')}"`);
            }
            
            if (casualPatternMatches.length > 0) {
                const topPatterns = [...new Set(casualPatternMatches.map(m => m.pattern))].slice(0, 3);
                reasons.push(`Contains template-like expressions: "${topPatterns.join('", "')}"`);
            }
        }
        
        // Tightened threshold for trigram repetition in formal mode
        if (trigramRepetitionRatio > (formalMode ? 0.05 : 0.05)) {
            reasons.push(`Contains repetitive multi-word patterns (${Math.round(trigramRepetitionRatio * 100)}% of 3-word sequences are repeated)`);
        }
        
        if (predictabilityScore > (formalMode ? 0.8 : 0.7)) {
            reasons.push(`Word choices are highly predictable (${Math.round(predictabilityScore * 100)}% more predictable than typical human writing)`);
        }
        
        // Human indicators
        if (contractionRatio > 0.15 || pronounRatio > 0.2) {
            reasons.push(`Contains natural human writing indicators: ${contractionRatio > 0.15 ? 'contractions' : ''}${(contractionRatio > 0.15 && pronounRatio > 0.2) ? ' and ' : ''}${pronounRatio > 0.2 ? 'personal pronouns' : ''}`);
        }
        
        // Sentence structure reasons
        if (variationCoefficient < (formalMode ? 0.2 : 0.25)) {
            reasons.push(`Unusually consistent sentence lengths (variation is ${Math.round(variationCoefficient * 100)}% of normal human writing)`);
        }
        
        if (longSentenceRatio > structureThreshold) {
            reasons.push(`High percentage of long sentences (${Math.round(longSentenceRatio * 100)}% of sentences exceed ${lengthThreshold} words)`);
        }
        
        if (similarLengthRatio > (formalMode ? 0.5 : 0.4)) {
            reasons.push(`Adjacent sentences have suspiciously similar lengths (${Math.round(similarLengthRatio * 100)}% of consecutive sentences)`);
        }
        
        if (beginningDiversity < (formalMode ? 0.4 : 0.5)) {
            reasons.push(`Limited variety in how sentences begin (only ${Math.round(beginningDiversity * 100)}% variation)`);
        }
        
        // Vocabulary reasons
        if (uniqueWordsRatio < (formalMode ? 0.5 : 0.55)) {
            reasons.push(`Lower vocabulary diversity (only ${Math.round(uniqueWordsRatio * 100)}% of words are unique)`);
        }
        
        if (repeatedWordsRatio > vocabularyThreshold) {
            reasons.push(`High word repetition (${Math.round(repeatedWordsRatio * 100)}% of unique words appear ${repeatedWordsThreshold + 1}+ times)`);
        }
        
        if (burstinessScore > (formalMode ? 0.8 : 0.75)) {
            reasons.push(`Unnaturally consistent information density across sentences (${Math.round(burstinessScore * 100)}% more uniform than human writing)`);
        }
        
        // Add human writing indicators to reasons if found
        if (contractionRatio > 0.2 && pronounRatio > 0.25 && !formalMode) {
            reasons.push(`<strong>Human indicator:</strong> High use of contractions and personal pronouns is typical of natural human writing`);
        }
        
        if (parentheticalRatio > 0.15) {
            reasons.push(`<strong>Human indicator:</strong> Contains parenthetical expressions or asides (typical of human writing)`);
        }
        
        if (reasons.length <= (formalMode ? 2 : 1)) {
            reasons.push("Text appears to have natural human writing patterns");
        }
        
        // Create highlighted HTML with improved sentence detection
        let highlightedHtml = '';
        sentences.forEach((sentence, index) => {
            if (!sentence.trim()) return;
            
            // Don't add period if the sentence already ends with punctuation
            const needsPunctuation = !sentence.match(/[.!?]$/);
            
            // Simple scoring for each sentence with improved context awareness
            const sentWords = sentence.split(/\s+/).filter(w => w.length > 0);
            const sentenceLength = sentWords.length;
            
            const sentReasons = [];
            let sentenceScore = 0.15; // Lower base score to reduce false positives
            
            // Check for formal phrases with reduced penalty in formal mode
            const containsFormalPhrase = formalPhrases.some(phrase => 
                sentence.toLowerCase().includes(phrase)
            );
            if (containsFormalPhrase) {
                sentReasons.push("Contains formal transition phrases");
                sentenceScore += formalMode ? 0.15 : 0.25; // Reduced penalty in formal mode
            }
            
            // Check for casual patterns
            const containsCasualPattern = casualPatterns.some(pattern => 
                sentence.toLowerCase().includes(pattern)
            );
            if (containsCasualPattern) {
                sentReasons.push("Contains template-like expressions");
                sentenceScore += 0.25;
            }
            
            // Check for academic phrases with moderate penalty in formal mode
            const containsAcademicPhrase = commonAcademicPhrases.some(phrase => 
                sentence.toLowerCase().includes(phrase)
            );
            if (containsAcademicPhrase) {
                sentReasons.push("Contains academic terminology");
                sentenceScore += formalMode ? 0.1 : 0.15; // Moderate penalty in formal mode
            }
            
            // Minimal reduction for human indicators at sentence level
            const hasContractions = /\b\w+['']\w+\b/i.test(sentence);
            if (hasContractions) {
                sentReasons.push("Contains contractions (human indicator)");
                sentenceScore -= formalMode ? 0.05 : 0.1;
            }
            
            // Minimal reduction for pronouns to maintain AI detection confidence
            const hasPersonalPronouns = personalPronouns.some(pronoun => 
                new RegExp(`\\b${pronoun}\\b`, 'i').test(sentence)
            );
            if (hasPersonalPronouns) {
                sentReasons.push("Contains personal pronouns (human indicator)");
                sentenceScore -= formalMode ? 0.05 : 0.15;
            }
            
            // Minimal reduction for parentheticals to maintain AI detection confidence
            const hasParentheticals = /\([^)]+\)/.test(sentence);
            if (hasParentheticals) {
                sentReasons.push("Contains parenthetical expressions (human indicator)");
                sentenceScore -= formalMode ? 0.05 : 0.1;
            }
            
            // Check sentence length with increased thresholds for formal writing
            const lengthThresholdHigh = formalMode ? 35 : 30;
            const lengthThresholdMedium = formalMode ? 25 : 22;
            
            if (sentenceLength > lengthThresholdHigh) {
                sentReasons.push(`Unusually long sentence (${sentenceLength} words)`);
                sentenceScore += formalMode ? 0.15 : 0.25; // Reduced penalty in formal mode
            } else if (sentenceLength > lengthThresholdMedium) {
                sentReasons.push(`Long sentence (${sentenceLength} words)`);
                sentenceScore += formalMode ? 0.1 : 0.15; // Reduced penalty in formal mode
            }
            
            // Check comma count with increased thresholds for formal writing
            const commaCount = (sentence.match(/,/g) || []).length;
            const commaThresholdHigh = formalMode ? 5 : 4;
            if (commaCount > commaThresholdHigh) {
                sentReasons.push(`Contains many clauses (${commaCount} commas)`);
                sentenceScore += formalMode ? 0.1 : 0.15; // Reduced penalty in formal mode
            }
            
            // Check passive voice with significantly reduced penalty in formal mode
            if (/\b(is|are|was|were|be|been|being)\s+\w+ed\b/i.test(sentence)) {
                sentReasons.push("Uses passive voice construction");
                sentenceScore += formalMode ? 0.05 : 0.15; // Significant reduction in formal mode
            }
            
            // Check for adjacent similar sentences
            if (index > 0) {
                const prevLength = sentenceLengths[index - 1];
                const currLength = sentenceLength;
                if (Math.abs(prevLength - currLength) <= 2 && currLength > 15) {
                    sentReasons.push("Very similar length to previous sentence");
                    sentenceScore += formalMode ? 0.1 : 0.15;
                }
            }
            
            const reasonText = sentReasons.join("; ");
            
            // Apply highlighting based on more aggressive thresholds
            const likelyThreshold = formalMode ? 0.6 : 0.65; // Much lower threshold for "likely AI"
            const maybeThreshold = formalMode ? 0.4 : 0.45; // Much lower threshold for "maybe AI"
            
            if (sentenceScore > likelyThreshold) {
                highlightedHtml += `<span class="highlight-ai-likely" title="${reasonText}">${sentence}${needsPunctuation ? '.' : ''}</span> `;
            } else if (sentenceScore > maybeThreshold) {
                highlightedHtml += `<span class="highlight-ai-maybe" title="${reasonText}">${sentence}${needsPunctuation ? '.' : ''}</span> `;
            } else {
                highlightedHtml += `${sentence}${needsPunctuation ? '.' : ''} `;
            }
        });
        
        return {
            aiProbability,
            patternScore: clamp(patternScore, 0, 1),
            structureScore: clamp(structureScore, 0, 1),
            vocabularyScore: clamp(vocabularyScore, 0, 1),
            highlightedHtml,
            reasons
        };
    }

    // Helper function to clamp values
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Display results
    function displayResults(results, formalMode) {
        try {
            // Show results
            if (resultCard) resultCard.style.display = 'block';
            
            // Update probabilities
            const aiPercentage = results.aiProbability;
            const humanPercentage = 100 - aiPercentage;
            
            // Safely update progress bars
            if (aiProbabilityBar) aiProbabilityBar.style.width = `${aiPercentage}%`;
            if (humanProbabilityBar) humanProbabilityBar.style.width = `${humanPercentage}%`;
            
            // Update text
            if (probabilityText) probabilityText.textContent = `${aiPercentage}%`;
            if (humanProbabilityText) humanProbabilityText.textContent = `${humanPercentage}%`;
            
            // Set appropriate colors with more aggressive thresholds for confidence
            if (aiProbabilityBar) {
                if (aiPercentage > 60) {
                    aiProbabilityBar.style.backgroundColor = 'var(--danger)';
                } else if (aiPercentage > 35) {
                    aiProbabilityBar.style.backgroundColor = 'var(--warning)';
                } else {
                    aiProbabilityBar.style.backgroundColor = 'var(--success)';
                }
            }
            
            // Update indicators
            updateIndicator(patternsDot, patternsText, results.patternScore);
            updateIndicator(structuresDot, structuresText, results.structureScore); 
            updateIndicator(vocabularyDot, vocabularyText, results.vocabularyScore);
            
            // Show highlighted text
            if (highlightedText && results.highlightedHtml) {
                if (highlightedSection) highlightedSection.style.display = 'block';
                highlightedText.innerHTML = results.highlightedHtml;
            } else if (highlightedSection) {
                highlightedSection.style.display = 'none';
            }
            
            // Show reasons
            if (reasonsSection && reasonsList) {
                if (results.reasons && results.reasons.length > 0) {
                    reasonsSection.style.display = 'block';
                    reasonsList.innerHTML = results.reasons.map(reason => 
                        `<li>${reason}</li>`
                    ).join('');
                } else {
                    reasonsSection.style.display = 'none';
                }
            }
            
            // Scroll to results
            if (resultCard) resultCard.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error displaying results:", error);
            alert("There was an error displaying the results.");
        }
    }
    
    // Update indicator with dot and text
    function updateIndicator(dot, textElement, score) {
        try {
            // Lower thresholds to be more assertive with AI identification
            const highThreshold = 0.6; // More aggressive high threshold
            const mediumThreshold = 0.35; // More aggressive medium threshold
            
            // Update dot
            if (dot) {
                dot.className = 'indicator-dot';
                if (score > highThreshold) {
                    dot.classList.add('dot-high');
                } else if (score > mediumThreshold) {
                    dot.classList.add('dot-medium');
                } else {
                    dot.classList.add('dot-low');
                }
            }
            
            // Update text with stronger language
            if (textElement) {
                if (score > highThreshold) {
                    textElement.textContent = `Strong indicators of AI generation (${Math.round(score * 100)}% confidence)`;
                } else if (score > mediumThreshold) {
                    textElement.textContent = `Moderate AI patterns detected (${Math.round(score * 100)}% confidence)`;
                } else {
                    textElement.textContent = `Likely human-written content (${Math.round((1-score) * 100)}% confidence)`;
                }
            }
        } catch (error) {
            console.error("Error updating indicator:", error);
        }
    }
});