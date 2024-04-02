import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import URL_CONFIG from './Components/global-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import {Dimensions} from 'react-native';
import BottomTabBarClient from './Components/BottomTabBarClient';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const Clients = () => {
  const navigation = useNavigation();
  const [orientation, setOrientation] = useState('portrait');

  ////  API  End ////
  const [refreshing, setRefreshing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);

  //   /**
  //    * Triggers when user navigation screen is focused
  //    */

  useEffect(() => {
    setIsListEnd(false);
    setDataSource([]);
    setSearchQuery('');
    setOffset(1);
    getData();
    changeOrientation();
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

  //   /**
  //    * Triggers when screen is focused
  //    */

  useFocusEffect(
    React.useCallback(() => {
      setIsListEnd(false);
      setDataSource([]);
      setSearchQuery('');
      setOffset(1);
      getData();
      changeOrientation();
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

  //   /**
  //    * orientationChange when screen refresh and screen are updated
  //    */

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

  /**
   * Fetch client data
   */

  async function getDataRefresh() {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    //Service to get the data from the server to render
    fetch(URL_CONFIG.Url + `api/clients?page=1&search=`, options)
      //Sending the current offset with get request
      .then(response => response.json())
      .then(responseJson => {
        setRefreshing(false);
        if (responseJson.success == true) {
          if (responseJson.clients.data.length > 0) {
            setOffset(1 + 1);
            //After the response increasing the offset for the next API call.
            setDataSource(responseJson.clients.data);
            setLoading(false);
          } else {
            setIsListEnd(true);
            setLoading(false);
          }
        } else if (responseJson.success == false) {
          setLoading(false);
          if (newData.status_code == 401) {
            AsyncStorage.clear();
            Alert.alert(responseJson.message);
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          }
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch client data
   */

  async function getData() {
    var userToken = await AsyncStorage.getItem('userToken');
    if (!loading && !isListEnd) {
      setLoading(true);
      var options = {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      };
      fetch(URL_CONFIG.Url + `api/clients?page=` + offset + `&search=`, options)
        .then(response => response.json())
        .then(responseJson => {
          setRefreshing(false);
          if (responseJson.success == true) {
            if (responseJson.clients.data.length > 0) {
              setOffset(offset + 1);
              setDataSource([...dataSource, ...responseJson.clients.data]);
              setLoading(false);
            } else {
              setIsListEnd(true);
              setLoading(false);
            }
          } else if (responseJson.success == false) {
            setLoading(false);
            if (responseJson.status_code == 401) {
              AsyncStorage.clear();
              Alert.alert(responseJson.message);
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
            }
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  /**
   * Fetch client list Search bar function from api
   */

  const SearchFetch = async text => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    if (text.length > 2) {
      setTimeout(() => {
        fetch(URL_CONFIG.Url + `api/clients?search=${text}`, options)
          .then(response => response.json())
          .then(responseJson => {
            const newData = responseJson;
            if (newData.success == true) {
              //console.log(newData.clients.data);
              setDataSource(newData.clients.data);
            } else if (newData.success == false) {
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
            }
          })
          .catch(error => {
            console.warn(error);
          });
      }, 200);
    } else if (text.length < 1) {
      setDataSource();
      setOffset(1);
      getData();
    }
  };

  /**
   * when user on screen Refresh
   */

  function refreshingFunction() {
    setOffset(1);
    setIsListEnd(false);
    setDataSource([]);
    setRefreshing(true);
    getDataRefresh();
  }
  const renderFooter = () => {
    return (
      //Footer View with Loader
      <View style={styles.footer}>
        {refreshing == true ? (
          <></>
        ) : (
          <>
            {loading ? (
              <ActivityIndicator
                color="#5dbf06"
                size="large"
                style={{margin: 15}}
              />
            ) : null}
          </>
        )}
      </View>
    );
  };

  const ItemView = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.BoxContainer}
        onPress={() =>
          navigation.navigate(
            NAVIGATION_STRING_CONSTANTS.client_tickets_screen,
            {
              ClientId: item.id,
              ClientFName: item.fname,
              ClientLName: item.lname,
              ClientEmail: item.email,
              ClientMobile: item.phone_no_1,
            },
          )
        }>
        <View style={styles.BoxDataContainer}>
          <View style={styles.BoxData}>
            <Text style={styles.BoxDataClientNameText}>
              {item.fname} {item.lname}
            </Text>
            <Text style={styles.BoxDataClientDetailText}>{item.email}</Text>
            <Text style={styles.BoxDataClientDetailText}>
              +{item.phone_no_1}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                NAVIGATION_STRING_CONSTANTS.client_tickets_screen,
                {
                  ClientId: item.id,
                  ClientFName: item.fname,
                  ClientLName: item.lname,
                  ClientEmail: item.email,
                  ClientMobile: item.phone_no_1,
                },
              )
            }>
            <Image
              style={styles.ViewIcon}
              source={require('./assets/ViewIcon.png')}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <></>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <View style={styles.MainContainer}>
        <TextInput
          placeholder={STRING_CONSTANTS.search_client_name}
          placeholderTextColor={'#666666'}
          style={styles.SearchBar}
          value={searchQuery}
          onChangeText={text => {
            SearchFetch(text);
            setSearchQuery(text);
          }}
        />
        <FlatList
          data={dataSource}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemSeparatorView}
          renderItem={ItemView}
          ListFooterComponent={renderFooter}
          onEndReached={searchQuery ? null : getData}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              tintColor={'#8bc34a'}
              refreshing={refreshing}
              onRefresh={refreshingFunction}
            />
          }
        />
      </View>
      
      {/* <TouchableOpacity
        style={styles.FloatingButton}
        onPress={() =>
          navigation.navigate(NAVIGATION_STRING_CONSTANTS.create_client_screen)
        }>
        <Image
          style={styles.FloatingButtonIcon}
          source={require('./assets/FloatingButton.png')}
        />
      </TouchableOpacity> */}

      {/* BOTTOM TAB BAR */}
      <BottomTabBarClient />
    </SafeAreaView>
  );
};
export default Clients;
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  FloatingButton: {
    borderRadius: 50,
    position: 'absolute',
    height: 80,
    width: 80,
    backgroundColor: '#FFFFFF',
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    right: 30,
    bottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.38,
    shadowRadius: 5.5,
    elevation: 10,
  },
  FloatingButtonIcon: {
    resizeMode: 'contain',
    height: 55,
    width: 55,
  },
  SearchBar: {
    height: 50,
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#000000',
    borderRadius: 5,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 5,
  },
  DataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#E0E9ED',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.11,
    hadowRadius: 2.62,
    elevation: 4,
  },
  BoxDataClientDetailText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  TicketButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  //  new box
  BoxContainer: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 15,
  },
  BoxData: {
    flexDirection: 'column',
  },
  BoxDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ViewIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  BoxDataClientNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
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
    tintColor: 'black',
  },
  BottomTabBarImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#5dbf06',
  },
  BottomTabBarText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
});
