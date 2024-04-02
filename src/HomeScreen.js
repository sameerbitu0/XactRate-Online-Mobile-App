import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  BackHandler,
  Platform,
  ActivityIndicator,
  Button,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import DashboardBox from './Components/DashboardBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import URL_CONFIG from './Components/global-config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import { Dimensions } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';

const Home = () => {
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [orientation, setOrientation] = useState('portrait');
  const [userData, setUserData] = useState([]);
  const [clients, setClients] = useState(null);
  const [tickets, setTickets] = useState(null);


  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    getInvoiceData();
    fetchDashboardData();
    changeOrientation();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (Platform.OS === 'ios') {
          // Exit app on iOS
          //BackHandler.exitApp();
          RNExitApp.exitApp();
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      },
    );
    return () => backHandler.remove();
  }, []);

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      getInvoiceData();
      fetchDashboardData();
      changeOrientation();
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (Platform.OS === 'ios') {
            // Exit app on iOS
            BackHandler.exitApp();
            return true;
          } else {
            BackHandler.exitApp();
            return true;
          }
        },
      );
      return () => backHandler.remove();
    }, []),
  );

  /**
   * orientationChange when screen refresh and screen are updated
   */

  function changeOrientation() {
    const handleOrientationChange = () => {
      const { width, height } = Dimensions.get('window');
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
   * fetchDashboardData api get from backend api
   */

  const fetchDashboardData = async () => {
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
          //console.log(newData.clients.data);
          setClients(newData.clients.data);
          setTickets(newData.tickets.data);
        } else if (newData.success == false) {
          if (newData.status_code == 401) {
            AsyncStorage.clear();
            Alert.alert(newData.message);
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          }
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };

  /**
   * userData Get from async storage
   */

  const getInvoiceData = async () => {
    try {
      var userData = await AsyncStorage.getItem('userData');
      userData = JSON.parse(userData);
      setUserData(userData.user);
      //console.log(userData.user);
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
              style={styles.BottomTabBarImageIcon}
              source={require('./assets/dashboard.png')}
            />
            <Text
              style={{
                color: '#5dbf06',
                fontFamily: 'DMSans-Bold',
                fontSize: 15,
              }}>
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.schedule_screen,
              })
            }>
            <Image
              style={styles.BottomTabBarImage}
              source={require('./assets/tabbar1.png')}
            />
            <Text style={styles.BottomTabBarText}>Schedule</Text>
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
              source={require('./assets/tabbar2.png')}
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
              source={require('./assets/invoice.png')}
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
              source={require('./assets/tabbar3.png')}
            />
            <Text style={styles.BottomTabBarText}>All Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.BottomTabBarButton} onPress={logout}>
            <Image
              style={styles.BottomTabBarImage}
              source={require('./assets/tabbar4.png')}
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
              style={styles.BottomTabBarImageIcon}
              source={require('./assets/dashboard.png')}
            />
            <Text
              style={{
                color: '#5dbf06',
                fontFamily: 'DMSans-Bold',
                fontSize: 15,
              }}>
              Dashboard
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
              source={require('./assets/tabbar2.png')}
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
              source={require('./assets/tabbar3.png')}
            />
            <Text style={styles.BottomTabBarText}>All Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.BottomTabBarButton} onPress={logout}>
            {/* onPress={logout} */}
            <Image
              style={styles.BottomTabBarImage}
              source={require('./assets/tabbar4.png')}
            />
            <Text style={styles.BottomTabBarText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  function InvoiceNavigation(ticket) {
    navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen, {
      ClientId: ticket.client_id,
      TicketId: ticket.id,
      ClientFName: ticket.first_name,
      ClientLName: ticket.last_name,
      ClientEmail: ticket.email,
      ClientMobile: ticket.phone_no_1,
      TicketDescription: ticket.ticket_type_description,
      TicketTypeId: ticket.ticket_type_id,
      Status: ticket.status,
    });
  }

  /**
   * log Out Function And Api
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
          } else {
            console.log(newData);
          }
        });
    } catch (error) {
      console.warn(error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.MainContainer}>
          <Image
            style={styles.XrLogo}
            source={require('./assets/logo_png.png')}
          />
          <Text style={styles.UserNameTittle}>
            {STRING_CONSTANTS.user_name_tittle} {userData.full_name}
          </Text>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <DashboardBox />
          </View>
        </View>
        <View style={styles.ViewAllClientContainer}>
          <Text style={styles.ClientTittleText}>
            {STRING_CONSTANTS.recent_clients}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.clients_screen,
              })
            }>
            <Text style={styles.ViewTittleText}>View all</Text>
          </TouchableOpacity>
        </View>
        {clients ? (
          clients.length > 0 ? (
            <>
              {clients.map((client, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.ClientBoxContainer}
                    onPress={() =>
                      navigation.navigate(
                        NAVIGATION_STRING_CONSTANTS.client_tickets_screen,
                        {
                          ClientId: client.id,
                          ClientFName: client.fname,
                          ClientLName: client.lname,
                          ClientEmail: client.email,
                          ClientMobile: client.phone_no_1,
                        },
                      )
                    }>
                    <Text style={styles.ClientNameText}>
                      {client.lname} {client.lname}
                    </Text>
                    <Text style={styles.ClientDetailText}>{client.email}</Text>
                    <Text style={styles.ClientDetailText}>
                      {'+'}
                      {client.phone_no_1}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{color:'#000',fontSize:15,padding:10,fontFamily:'DMSans-Medium'}}>No clients available</Text>
            </View>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={30} color="#5dbf06" />
          </View>
        )}


        <View style={styles.ViewAllTicketContainer}>
          <Text style={styles.ClientTittleText}>
            {STRING_CONSTANTS.recent_tickets}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Root', {
                screen: NAVIGATION_STRING_CONSTANTS.details_screen,
              })
            }>
            <Text style={styles.ViewTittleText}>View all</Text>
          </TouchableOpacity>
        </View>
        {tickets !== null ? (
          tickets.length > 0 ? (
            <>
              {tickets.map((ticket, index) => (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => InvoiceNavigation(ticket)}
                    style={styles.ClientBoxContainer}>
                    <Text style={styles.ClientNameText}>
                      {ticket.first_name} {ticket.last_name}
                    </Text>
                    <Text style={styles.ClientDetailText}>
                      {ticket.ticket_type_description}
                    </Text>                  
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text style={styles.ClientDetailText}>{ticket.date}</Text>
                      <View style={styles.ScheduleStatusView}>
                        {ticket.status == 1 && (
                          <Text style={styles.ScheduleText}>
                            {STRING_CONSTANTS.schedule}
                          </Text>
                        )}
                      </View>
                    </View>

                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{color:'#000',fontSize:15,padding:10,fontFamily:'DMSans-Medium'}}>No tickets available</Text>
            </View>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={30} color="#5dbf06" />
          </View>
        )}


      </ScrollView>
      {/* BOTTOM TAB BAR */}
      {BottomSheetView()}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    color: 'black',
  },
  drawerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
  },
  MainContainer: {
    flex: 1,
    padding: 8,
  },
  XrLogo: {
    alignSelf: 'center',
    width: 150,
    height: 80,
    resizeMode: 'contain',
  },
  UserNameTittle: {
    textAlign: 'center',
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    margin: 10,
    fontWeight: '700',
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
  },
  BottomTabBarText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    color: '#333',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  ClientTittleText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    marginHorizontal: 20,
  },
  ViewTittleText: {
    color: '#478113',
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    marginHorizontal: 20,
    borderBottomWidth: 0.8,
    borderColor: '#5DBF06',
  },
  ClientBoxContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 5,
    borderColor: '#B2B9BF',
    borderWidth: 0.8,
    borderRadius: 3,
    padding: 10,
  },
  ClientNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  ClientDetailText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    margin: 2,
  },
  ScheduleStatusView: {
    backgroundColor: '#5DBF06',
    paddingHorizontal: 18,
    textAlign: 'center',
    paddingVertical: 2,
    borderRadius: 15,
    width: 140,
  },
  ScheduleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },

  ViewAllClientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#B2B9BF',
    marginVertical: 10,
    paddingVertical: 10,
  },
  ViewAllTicketContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#B2B9BF',
    marginVertical: 10,
    paddingVertical: 10,
  },
});
