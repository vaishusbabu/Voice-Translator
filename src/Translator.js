
//SpeechSynthesisUtterance
import React, { useEffect, useState } from 'react';
import './App.css';
import languageList from './language.json';
import axios from 'axios';
import { AudioMutedOutlined, AudioOutlined, CopyOutlined, ShareAltOutlined, SoundOutlined, SwapOutlined } from '@ant-design/icons';

export default function Translator() {
    const [inputFormat, setInputFormat] = useState('en');
    const [outputFormat, setOutputFormat] = useState('');
    const [translatedText, setTranslatedText] = useState('Translation');
    const [inputText, setInputText] = useState('');
    const [recognizing, setRecognizing] = useState(false);

    let recognition;
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Web Speech API is not supported in this browser.');
    } else {
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = inputFormat;

        recognition.onstart = () => {
            setRecognizing(true);
        };

        recognition.onresult = (event) => {
            setRecognizing(false);
            const speechToText = event.results[0][0].transcript;
            setInputText(speechToText);
        };

        recognition.onerror = (event) => {
            setRecognizing(false);
            console.error('Speech recognition error', event.error);
        };

        recognition.onend = () => {
            setRecognizing(false);
        };
    }

    const startRecognition = () => {
        if (recognition) {
            recognition.lang = inputFormat;
            recognition.start();
        }
    };

    const handleReverseLanguage = () => {
        const value = inputFormat;
        setInputFormat(outputFormat);
        setOutputFormat(value);
        setInputText('');
        setTranslatedText('Translation');
    };

    const handleRemoveInputText = () => {
        setInputText('');
        setTranslatedText('Translation');
    };
    const generateMailtoLink = () => {
        const subject = encodeURIComponent("Translated Text");
        const body = encodeURIComponent(translatedText);
        return `mailto:?subject=${subject}&body=${body}`;
    };
    const handleTranslate = async () => {
        if (!inputText || !inputFormat || !outputFormat) return;

        setTranslatedText('Translating...');

        const options = {
            method: 'POST',
            url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
            params: {
                'api-version': '3.0',
                to: outputFormat,
                from: inputFormat
            },
            headers: {
                'x-rapidapi-key': '12bee6d5f7msh0678d481138dcf0p114d09jsne8bd4a5a74e3',
                'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: [{
                Text: inputText
            }]
        };

        try {
            const response = await axios.request(options);
            const translation = response.data[0].translations[0].text;
            console.log("translation", translation);
            setTranslatedText(translation);
        } catch (error) {
            console.error(error);
            setTranslatedText('Error in translation');
        }
    };

    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('Voices loaded:', voices);
        };
    }, []);

    const handleSpeak = () => {
        if (translatedText && translatedText !== 'Translation' && translatedText !== 'Translating...' && translatedText !== 'Error in translation') {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            utterance.lang = outputFormat;

            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices);

            const supportedVoices = voices.filter(voice => voice.lang.startsWith(outputFormat.split('-')[0]));
            console.log(`Supported voices for ${outputFormat}:`, supportedVoices);

            if (supportedVoices.length > 0) {
                utterance.voice = supportedVoices[0];
                utterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event.error);
                };
                window.speechSynthesis.speak(utterance);
            } else {
                console.warn(`Speech synthesis for language ${outputFormat} is not supported.`);
                alert(`Speech synthesis for language ${outputFormat} is not supported.`);
            }
        }
    };

    const handleCopy = () => {
        if (translatedText && translatedText !== 'Translation' && translatedText !== 'Translating...' && translatedText !== 'Error in translation') {
            navigator.clipboard.writeText(translatedText).then(() => {
                console.log("copied!");
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };

    return (
        <div className="container">
            <div className="row1">
                <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value)}>
                    {Object.keys(languageList).map((key, index) => {
                        const language = languageList[key];
                        return (
                            <option key={index} value={key}>{language.name}</option>
                        );
                    })}
                </select>
                <SwapOutlined onClick={handleReverseLanguage} />

                <select value={outputFormat} onChange={(e) => {
                    setOutputFormat(e.target.value);
                    setTranslatedText('Translation');
                }}>
                    {Object.keys(languageList).map((key, index) => {
                        const language = languageList[key];
                        return (
                            <option key={index + 118} value={key}>{language.name}</option>
                        );
                    })}
                </select>
            </div>
            <div className="row2">
                <div className="inputText">
                    <svg className='removeinput'
                        style={{ display: (inputText.length) ? "block" : "none" }}
                        onClick={handleRemoveInputText}
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                        </path>
                    </svg>
                    <textarea type="text"
                        value={inputText}
                        placeholder='Enter Text'
                        onChange={(e) => setInputText(e.target.value)} />
                </div>
                <button
                    className="btnbtn-mic btn-primary"
                    onClick={startRecognition}
                    disabled={recognizing}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                    {recognizing ? <AudioOutlined /> : <AudioMutedOutlined />}
                </button>
                <div className="outputText">{translatedText}
                    {translatedText !== 'Translation' && translatedText !== 'Translating...' && translatedText !== 'Error in translation' && (
                        <>
                            <div className='buttons'>
                                <SoundOutlined onClick={handleSpeak} />
                                <CopyOutlined onClick={handleCopy} />
                                <a href={generateMailtoLink()}>
                                    <ShareAltOutlined />
                                </a>
                            </div>
                        </>
                    )}
                </div>

            </div>
            <div className="row3">
                <button className='btn'
                    onClick={handleTranslate}>
                    <i className="fa fa-spinner fa-spin"></i>
                    <span className='translate'>Translate</span>
                </button>
            </div>
        </div>
    );
}
