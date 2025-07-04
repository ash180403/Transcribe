import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Text,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [ttsText, setTtsText] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = () => console.log('🎤 Recording started');
    Voice.onSpeechEnd = () => {
      console.log(' Recording ended');
      setIsListening(false);
    };
    Voice.onSpeechResults = (event) => {
      console.log(' Final Result:', event.value);
      if (event.value?.[0]) setSearchText(event.value[0]);
    };
    Voice.onSpeechPartialResults = (event) => {
      console.log(' Partial Result:', event.value);
      if (event.value?.[0]) setSearchText(event.value[0]);
    };
    Voice.onSpeechError = (error) => {
      console.log(' Speech Error:', error);
      setIsListening(false);
    };

    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for speech recognition',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('Mic permission:', granted);
        const services = await Voice.getSpeechRecognitionServices();
        console.log('Speech Services:', services);
      }
    };

    requestPermissions();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('en-US', {
        EXTRA_PARTIAL_RESULTS: true, 
      });
      setIsListening(true);
    } catch (error) {
      console.log('Start Listening Error', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log('Stop Listening Error', error);
    }
  };

  const speakText = () => {
    Tts.speak(ttsText);
  };

  return (
    <View style={styles.page}>
      {/* Top: Speech to Text */}
      <View style={styles.half}>
        <Text style={styles.sectionTitle}>🎙 Speech to Text</Text>
        <View style={styles.container}>
          <TextInput
            placeholder="Say something..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => (isListening ? stopListening() : startListening())}
            style={styles.iconContainer}
          >
            {isListening ? (
              <View style={styles.dotsContainer}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            ) : (
              <Icon name="microphone" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom: Text to Speech */}
      <View style={styles.half}>
        <Text style={styles.sectionTitle}>📢 Text to Speech</Text>
        <View style={styles.container}>
          <TextInput
            placeholder="Type to speak..."
            value={ttsText}
            onChangeText={setTtsText}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={speakText} style={styles.iconContainer}>
            <Icon name="volume-high" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  half: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 20,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#000',
  },
  iconContainer: {
    marginLeft: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginHorizontal: 2,
  },
});

export default App;
