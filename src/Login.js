import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  BackHandler,
  Modal,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import URL_CONFIG from './Components/global-config';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const Login = () => {
  const navigation = useNavigation();

  //// Variable initialization  ////

  const [errorMessage, setErrorMessage] = useState(false);
  const [email, setEmail] = useState('user@mail.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    // setPassword();
    // setEmail();
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      // setPassword();
      // setEmail();
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }, []),
  );

  /**
   * Error Message Return Function
   */

  function messageReturn() {
    if (errorMessage) {
      return <Text style={styles.ErrorMessage}> {errorMessage} </Text>;
    }
  }

  /**
   * Submit button on press go to login user
   */

  const Submit = async () => {
    if (!email) {
      setErrorMessage(STRING_CONSTANTS.email_required);
    } else if (!password) {
      setErrorMessage(STRING_CONSTANTS.password_required);
    } else {
      setLoading(true);
      try {
        const response = await fetch(URL_CONFIG.Url + 'api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email: email, password: password}),
        });

        const data = await response.json();
        if (data.success == true) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(data));
          navigation.navigate('Root', {
            screen: NAVIGATION_STRING_CONSTANTS.schedule_screen,
          });
          setLoading(false);
        } else if (data.success == false) {
          Alert.alert(data.message);
          setLoading(false);
        } else {
          Alert.alert(data.message);
          setLoading(false);
        }
      } catch (error) {
        console.warn(error);
        setLoading(false);
      }
    }
  };

  ////  API End  ////
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
        <ScrollView>
          <Image
            style={styles.Logo}
            source={require('./assets/logo_png.png')}
          />
          <View style={styles.LoginScreenContainer}>
            <Text style={styles.logoText}>
              {STRING_CONSTANTS.login_screen_welcome_text}
            </Text>
            <Text style={styles.subHeading}>
              {STRING_CONSTANTS.login_screen_sub_heading_text}
            </Text>
            <TextInput
              type="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={email => {
                setEmail(email);
                setErrorMessage();
              }}
              style={styles.LoginFormTextInput}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={password => {
                setPassword(password);
                setErrorMessage();
              }}
              style={styles.LoginFormTextInput}
              secureTextEntry={true}
            />
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  NAVIGATION_STRING_CONSTANTS.reset_password_screen,
                )
              }>
              <Text style={styles.Forgot_Button}>
                {STRING_CONSTANTS.forgot_password_login}
              </Text>
            </TouchableOpacity>

            {messageReturn()}
          </View>
          <TouchableOpacity style={styles.ButtonStyle} onPress={() => Submit()}>
            <Text style={styles.loginText}> LOGIN </Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={{flex: 1}}>
          <Modal animationType="fade" transparent={true} visible={loading}>
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color="#5dbf06" />
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  LoginScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  Logo: {
    alignSelf: 'center',
    width: 300,
    height: 250,
    resizeMode: 'contain',
  },

  logoText: {
    fontSize: 25,
    paddingVertical: 5,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'DMSans-Bold',
  },

  subHeading: {
    fontSize: 20,
    paddingVertical: 10,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'DMSans-Bold',
  },

  LoginFormTextInput: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#fafafa',
    color: 'black',
    fontSize: 16,
    borderColor: '#B2B9BF',
    margin: 10,
    fontFamily: 'DMSans-Medium',
    padding: 15,
  },
  Forgot_Button: {
    margin: 10,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  ButtonStyle: {
    backgroundColor: '#5dbf06',
    borderWidth: 1,
    borderColor: '#7DE24E',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    marginHorizontal: 20,
  },
  loginText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
  },
  ErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
});
