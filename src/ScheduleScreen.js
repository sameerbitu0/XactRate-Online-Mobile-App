import React, {useState, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Dimensions} from 'react-native';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  BackHandler,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import URL_CONFIG from './Components/global-config';
import BottomTabBarSchedule from './Components/BottomTabBarSchedule';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
import STRING_CONSTANTS from './strings/strings';


const Schedule = () => {
  const navigation = useNavigation();

  const [orientation, setOrientation] = useState('portrait');
  const [refreshing, setRefreshing] = useState();
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);

  //   /**
  //    * Triggers when user navigation screen is focused
  //    */

  useEffect(() => {
    setDataSource([]);
    setRefresh(true);
    setIsListEnd(false);
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
      setDataSource([]);
      setRefresh(true);
      setIsListEnd(false);
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
   * when user on refresh screen
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
    fetch(URL_CONFIG.Url + 'api/schedules?status=&page=1', options)
      .then(response => response.json())
      .then(responseJson => {
        setRefreshing(false);
        if (responseJson.schedule.data.length > 0) {
          setOffset(1 + 1);
          setDataSource(responseJson.schedule.data);
          setLoading(false);
          setRefresh(false);
        } else {
          setRefresh(false);
          setIsListEnd(true);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * schedule fetch Api
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
      fetch(URL_CONFIG.Url + 'api/schedules?status=&page=' + offset, options)
        .then(response => response.json())
        .then(responseJson => {
          if (responseJson.schedule.data.length > 0) {
            setOffset(offset + 1);
            setDataSource([...dataSource, ...responseJson.schedule.data]);
            setLoading(false);
            setRefresh(false);
          } else {
            setRefresh(false);
            setIsListEnd(true);
            setLoading(false);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  function refreshingFunction() {
    setDataSource([]);
    setRefreshing(true);
    setRefresh(true);
    setIsListEnd(false);
    setOffset(1);
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
                color="#8bc34a"
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
        style={styles.dataViewBox}
        onPress={() =>
          navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen, {
            ClientId: item.client_id,
            TicketId: item.id,
            ClientFName: item.first_name,
            ClientLName: item.last_name,
            ClientEmail: item.email,
            ClientMobile: item.phone_no_1,
            TicketDescription: item.ticket_type_description,
            TicketTypeId: item.ticket_type_id,
          })
        }>
        <View style={styles.BoxRow}>
          <View style={styles.dataView}>
            <Text style={styles.ClientName}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={styles.ScheduleDetailsText}>
              {item.ticket_type_description}
            </Text>
            <Text style={styles.ScheduleDetailsText}>{item.date}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen, {
                ClientId: item.client_id,
                TicketId: item.id,
                ClientFName: item.first_name,
                ClientLName: item.last_name,
                ClientEmail: item.email,
                ClientMobile: item.phone_no_1,
                TicketDescription: item.ticket_type_description,
                TicketTypeId: item.ticket_type_id,
              })
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
    return <></>;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {refresh == false ? (
          dataSource.length > 0 ? (
            <FlatList
              data={dataSource}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={ItemSeparatorView}
              renderItem={ItemView}
              ListFooterComponent={renderFooter}
              onEndReached={getData}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  tintColor={'#8bc34a'}
                  refreshing={refreshing}
                  onRefresh={refreshingFunction}
                />
              }
            />
          ) : (
            <View style={{flex: 1, paddingVertical: 2}}>
              <Text
                style={{
                  color: '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                  textAlign: 'center',
                  margin: 10,
                  backgroundColor: '#eeeeee',
                  padding: 18,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.23,
                  shadowRadius: 2.62,
                  elevation: 4,
                  borderWidth: 0.3,
                  borderColor: 'gray',
                }}>
                {STRING_CONSTANTS.null_screen_data_string}
              </Text>
            </View>
          )
        ) : (
          <View style={{flex: 1, padding: 20}}>
            <ActivityIndicator size={'large'} color="#7ed321" />
          </View>
        )}
      </View>
      <BottomTabBarSchedule />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  ScheduleDetailsText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  dataViewBox: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 15,
  },
  BoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ClientName: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  ViewIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: 'black',
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
    tintColor: '#5dbf06',
  },
  BottomTabBarImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  BottomTabBarText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
});

export default Schedule;
