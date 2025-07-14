import { useEffect } from 'react';

const GoogleTranslator = () => {
    useEffect(() => {
        const addScript = () => {
            if (document.getElementById('google-translate-script')) return;

            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,fr,es,de',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                    },
                    'google_translate_element'
                );
            };
        };

        addScript();
    }, []);

    return <div id="google_translate_element" />;
};

export default GoogleTranslator
