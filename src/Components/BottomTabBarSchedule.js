import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import URL_CONFIG from './global-config';
import {Dimensions} from 'react-native';
import NAVIGATION_STRING_CONSTANTS from '../navigation/NavigarionStringConstants';
const BottomTabBarSchedule = () => {
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
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
  }, []);

  /**
   * Bottom tab bar logout function
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
          } else {
            console.log(newData);
          }
        });
    } catch (error) {
      console.warn(error);
    }
  };

  function BottomSheetView() {
    if (windowWidth > 700) {
      return (
        <View style={styles.BottomTabBarMainContainer}>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.home_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/dashboard.png')}
            />
            <Text style={styles.BottomTabBarText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.schedule_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImageIcon}
              source={require('../assets/tabbar1.png')}
            />
            <Text
              style={{
                color: '#5dbf06',
                fontFamily: 'DMSans-Bold',
                fontSize: 15,
              }}>
              Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.clients_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar2.png')}
            />
            <Text style={styles.BottomTabBarText}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen)
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/invoice.png')}
            />
            <Text style={styles.BottomTabBarText}>Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.details_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar3.png')}
            />
            <Text style={styles.BottomTabBarText}>All Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.BottomTabBarButton} onPress={logout}>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar4.png')}
            />
            <Text style={styles.BottomTabBarText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.BottomTabBarMainContainer}>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.home_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/dashboard.png')}
            />
            <Text style={styles.BottomTabBarText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.clients_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar2.png')}
            />
            <Text style={styles.BottomTabBarText}>Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.details_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar3.png')}
            />
            <Text style={styles.BottomTabBarText}>All Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.BottomTabBarButton} onPress={logout}>
            <Image
              style={styles.BottomTabBarImage}
              source={require('../assets/tabbar4.png')}
            />
            <Text style={styles.BottomTabBarText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
  return <>{BottomSheetView()}</>;
};

export default BottomTabBarSchedule;

const styles = StyleSheet.create({
  BottomTabBarMainContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#cccccc',
  },
  BottomTabBarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  BottomTabBarImageIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#5dbf06',
  },
  BottomTabBarImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  BottomTabBarText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
});
