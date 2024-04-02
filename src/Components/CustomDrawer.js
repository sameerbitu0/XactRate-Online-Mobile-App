import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DrawerActions} from '@react-navigation/native';
import URL_CONFIG from './global-config';
import NAVIGATION_STRING_CONSTANTS from '../navigation/NavigarionStringConstants';
import {Dimensions} from 'react-native';

const CustomDrawer = props => {
  const navigation = useNavigation();

  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    changeOrientation();
  }, []);

  /**
   * orientationChange when screen refresh and screen are updated
   */
  function changeOrientation() {
    const handleOrientationChange = () => {
      const {width, height} = Dimensions.get('window');
      if (width > height) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };
    const showListenerDimensions = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );
    const removeListenerDimensions = Dimensions.addEventListener(
      'change',
      handleOrientationChange,
    );
    return () => {
      removeListenerDimensions.remove();
      showListenerDimensions.remove();
    };
  }

  async function customProductIdNull() {
    var customProductId = 0;
    try {
      AsyncStorage.setItem('customProductId', JSON.stringify(customProductId));
    } catch (error) {
      console.warn(error);
    }
  }

  function invoiceOnPress() {
    navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen);
    navigation.dispatch(DrawerActions.closeDrawer());
    customProductIdNull();
  }

  /**
   * Logout function
   */

  const logout = async () => {
    var userToken = await AsyncStorage.getItem('userToken');

    try {
      // Send API request to invalidate user token
      const response = await fetch(URL_CONFIG.Url + 'api/logout', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          const newData = responseJson;
          if (newData.success == 'true') {
            // Remove token from AsyncStorage
            AsyncStorage.clear();
            // Redirect user to login screen
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          } else {console.log(newData)};
        });
    } catch (error) {
      console.warn(error);
    }
  };
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 20}}>
          <Image
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              width: 220,
              height: 130,
              resizeMode: 'contain',
            }}
            source={require('../assets/logo_png.png')}
          />
          <DrawerItemList {...props} />
          {windowWidth < 700 && (
            <TouchableOpacity onPress={() => invoiceOnPress()}>
              <Text
                style={{
                  fontFamily: 'DMSans-Bold',
                  fontSize: 15,
                  color: '#333333',
                  marginLeft: 20,
                  marginTop: 18,
                  fontWeight: '600',
                }}>
                Ticket
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={logout}>
            <Text
              style={{
                fontFamily: 'DMSans-Bold',
                fontSize: 15,
                color: '#333333',
                marginLeft: 20,
                marginTop: 20,
                fontWeight: '600',
              }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;
