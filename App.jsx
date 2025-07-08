import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

const backgroundImage = require('./assets/bg.jpg'); 

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);

    Voice.onSpeechEnd = () => setIsListening(false);

    Voice.onSpeechResults = async (event) => {
      const userSpeech = event.value?.[0];
      if (userSpeech) {
        const updatedHistory = [...conversationHistory, { role: 'app', content: userSpeech }];
        setConversationHistory(updatedHistory);
        handleCloudResponse(updatedHistory);
      }
    };

    Voice.onSpeechError = (error) => {
      console.log('Speech Error:', error);
      setIsListening(false);
      setIsTalking(false);
    };

    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      }
    };

    requestPermissions();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [conversationHistory]);

  const startConversation = async () => {
    try {
      setIsTalking(true);
      await Voice.start('en-US', { EXTRA_PARTIAL_RESULTS: false });
    } catch (error) {
      console.log('Start Listening Error', error);
      setIsTalking(false);
    }
  };

  const handleCloudResponse = async (history) => {
    const response = await simulateCloudResponse(history); // Replace with your API 
    const updatedHistory = [...history, response];
    setConversationHistory(updatedHistory);

    Tts.speak(response.content);

    if (response.disconnect) {
      setTimeout(() => setIsTalking(false), 1000);
    } else {
      setIsTalking(false);
    }
  };

  const simulateCloudResponse = async (history) => {
    const lastUserInput = history.filter(h => h.role === 'app').map(h => h.content).join(' ');

    if (lastUserInput.toLowerCase().includes('buying a drone')) {
      return {
        role: 'cloud',
        content: 'Oh so you are looking for recommendations for a drone. Shall I recommend some popular brands?',
      };
    }
    if (lastUserInput.toLowerCase().includes('less than $500')) {
      return {
        role: 'cloud',
        content: 'Sure, I would recommend a DJI Mini or Phantom Spark which are popular and within your budget. Do you want me to recommend more?',
      };
    }
    if (lastUserInput.toLowerCase().includes('thank you')) {
      return {
        role: 'cloud',
        content: 'Happy to help, cheers!',
        disconnect: 1,
      };
    }

    return {
      role: 'cloud',
      content: "I'm not sure I understood that. Can you repeat?",
    };
  };

  const resetConversation = () => {
    setConversationHistory([]);
    setIsListening(false);
    setIsTalking(false);
  };

  const renderChatLog = () => (
    <ScrollView
      ref={scrollRef}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      style={styles.chatLog}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {conversationHistory.map((entry, index) => (
        <View
          key={index}
          style={[
            styles.chatBubble,
            entry.role === 'app' ? styles.userBubble : styles.cloudBubble,
          ]}
        >
          <Text style={styles.chatText}>{entry.content}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderWaveform = () => (
    <View style={styles.waveform}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.refreshBtn} onPress={resetConversation}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tryMeButton, isTalking && styles.buttonDisabled]}
          onPress={startConversation}
          disabled={isTalking}
        >
          {isListening ? renderWaveform() : (
            <Text style={styles.buttonText}>{isTalking ? 'Listening...' : ' Try Me'}</Text>
          )}
        </TouchableOpacity>

        {renderChatLog()}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tryMeButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    elevation: 5,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatLog: {
    flex: 1,
    width: '100%',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    marginVertical: 6,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  cloudBubble: {
    backgroundColor: '#f8d7da',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  waveform: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  refreshBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    elevation: 3,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
