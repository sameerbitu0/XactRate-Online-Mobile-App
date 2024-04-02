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
  BackHandler,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import URL_CONFIG from './Components/global-config';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const ResetPassword = () => {
  const navigation = useNavigation();
  //// Variable initialization  ////
  const [errorMessage, setErrorMessage] = useState(false);
  const [email, setEmail] = useState();
  const [refreshingSubmit, setRefreshingSubmit] = useState();

  useEffect(() => {
    setEmail();
    // When user Back Navigation
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      setEmail();
      // When user Back Navigation
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.goBack();
          return true;
        },
      );
      return () => backHandler.remove();
    }, []),
  );

  /**
   * Return error message function
   */

  function messageReturn() {
    if (errorMessage) {
      return <Text style={styles.ErrorMessage}> {errorMessage} </Text>;
    }
  }

  /**
   * Send Reset Password Link function send email Api
   */

  const SendResetPasswordLinkButton = async () => {
    if (!email) {
      setErrorMessage(STRING_CONSTANTS.email_required);
    } else {
      setRefreshingSubmit(true);
      try {
        const response = await fetch(URL_CONFIG.Url + 'api/forget_password', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({email: email}),
        });
        const data = await response.json();
        setRefreshingSubmit(false);
        if (data.success == true) {
          navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          Alert.alert(data.message);
        } else {
          Alert.alert(data.message);
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  ////  API End  ////

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <ScrollView>
        <Image style={styles.Logo} source={require('./assets/logo_png.png')} />
        <View style={styles.ResetScreenContainer}>
          <Text style={styles.ScreenTittle}>
            {' '}
            {STRING_CONSTANTS.forgot_password}
          </Text>
          <View style={styles.ActivityIndicatorContainer}>
            {refreshingSubmit ? (
              <ActivityIndicator size="small" color="#5dbf06" />
            ) : null}
          </View>
          <TextInput
            type="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={email => {
              setEmail(email);
              setErrorMessage('');
            }}
            style={styles.EmailTextInput}
          />
          {messageReturn()}
        </View>
        <TouchableOpacity
          style={styles.ButtonStyle}
          onPress={() => SendResetPasswordLinkButton()}>
          <Text style={styles.ResetPasswordButtonText}>
            {STRING_CONSTANTS.reset_password_button_text}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen)
          }>
          <Text style={styles.SignInText}> {STRING_CONSTANTS.sign_in}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  ActivityIndicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ResetScreenContainer: {
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
  ScreenTittle: {
    fontSize: 20,
    paddingVertical: 5,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'DMSans-Bold',
  },
  EmailTextInput: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#fafafa',
    color: 'black',
    fontSize: 16,
    borderColor: '#B2B9BF',
    margin: 10,
    marginVertical: 20,
    fontFamily: 'DMSans-Medium',
    padding: 15,
  },
  SignInText: {
    marginHorizontal: 25,
    margin: 10,
    color: 'black',
    alignSelf: 'flex-end',
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
  ResetPasswordButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
  },
  ErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
});
