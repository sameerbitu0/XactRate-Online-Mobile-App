import {StyleSheet, Text, Image, SafeAreaView} from 'react-native';
import {useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import URL_CONFIG from './Components/global-config';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const Splash_Screen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    getUserToken();
  }, []);

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      getUserToken();
    }, []),
  );

  /**
   * Get data user information and check user token auth
   */

  const getUserToken = async key => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(URL_CONFIG.Url + 'api/dashboard', options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          try {
            const UserToken = AsyncStorage.getItem('userToken');
            if (UserToken == null) {
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
              // console.log(UserToken);
            } else {
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.schedule_screen,
              });
            }
          } catch (error) {
            console.warn(error);
          }
        } else if (newData.success == false) {
          if (newData.status_code == 401) {
            const asyncStorageKeys = AsyncStorage.getAllKeys();
            if (asyncStorageKeys.length > 0) {
              if (Platform.OS === 'android') {
                AsyncStorage.clear();
              }
              if (Platform.OS === 'ios') {
                AsyncStorage.multiRemove(asyncStorageKeys);
              }
            }

            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          }
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };
  return (
    <SafeAreaView style={styles.MainContainer}>
      <Image
        style={styles.ImageLogo}
        source={require('./assets/logo_png.png')}
      />
      <Text style={styles.LogoText}>{STRING_CONSTANTS.splash_screen_text}</Text>
    </SafeAreaView>
  );
};

export default Splash_Screen;

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  ImageLogo: {
    alignSelf: 'center',
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  LogoText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 25,
    fontFamily: 'DMSans-Bold',
  },
});
