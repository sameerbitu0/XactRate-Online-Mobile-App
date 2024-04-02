import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  RefreshControl,
} from 'react-native';
import URL_CONFIG from './Components/global-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import BottomTabBarTicket from './Components/BottomTabBarTicket';
import {Dimensions} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';

const DetailsScreen = () => {
  const navigation = useNavigation();
  const selectSheet = useRef(null);
  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');
  const [refreshing, setRefreshing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);

  //   //// fetchData Api ////

  const [selectTab, setSelectTab] = useState(0);
  const [status, setStatus] = useState(0);
  const [parameter, setParameter] = useState();
  const [parameterEditTicket, setParameterEditTicket] = useState();
  const [parameterTicketDetail, setParameterTicketDetail] = useState();

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    setDataSource([]);
    setSelectTab(0);
    setOffset(1);
    setStatus('schedule');
    getDataOnScreen((value = 'schedule'));
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

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    React.useCallback(() => {
      setDataSource([]);
      setSelectTab(0);
      setOffset(1);
      setStatus('schedule');
      getDataOnScreen((value = 'schedule'));
      changeOrientation();
      // When user Back Navigation
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // navigation.goBack();
          navigation.navigate('Root', {
            screen: NAVIGATION_STRING_CONSTANTS.home_screen,
          });
          return true;
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
   * when user on focus screen fetch ticket data
   */

  async function getDataOnScreen(value) {
    setDataSource('');
    setOffset(1);
    setStatus(value);
    setIsListEnd(false);
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    setLoading(true);
    fetch(URL_CONFIG.Url + `api/tickets?status=${value}&page=1`, options)
      .then(response => response.json())
      .then(responseJson => {
        setRefreshing(false);
        if (responseJson.success == true) {
          if (responseJson.tickets.data.length > 0) {
            setOffset(offset + 1);
            setDataSource(responseJson.tickets.data);
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

  /**
   * when on scrolling data and fetch load more data
   */

  async function getData() {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    if (!loading && !isListEnd) {
      setLoading(true);
      fetch(
        URL_CONFIG.Url + `api/tickets?status=${status}&page=` + offset,
        options,
      )
        .then(response => response.json())
        .then(responseJson => {
          if (responseJson.tickets.data.length > 0) {
            setOffset(offset + 1);
            setDataSource([...dataSource, ...responseJson.tickets.data]);
            setLoading(false);
          } else {
            setIsListEnd(true);
            setLoading(false);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  /**
   * Set param in variable
   */

  function Param(item) {
    setParameter({
      ClientId: item.client_id,
      TicketId: item.id,
      ClientFName: item.first_name,
      ClientLName: item.last_name,
      ClientEmail: item.email,
      ClientMobile: item.phone_no_1,
      TicketDescription: item.ticket_type_description,
      TicketTypeId: item.ticket_type_id,
      Status: item.status,
    });
    setParameterEditTicket({
      _Id: item.id,
      Client_Id: item.client_id,
      Ticket_TypeId: item.ticket_type_id,
      Ticket_Date: item.date,
      Client_FName: item.first_name,
      Client_LName: item.last_name,
      Ticket_TypeName: item.ticket_type_description,
      ClientEmail: item.email,
      TicketNotes: item.ticket_notes,
      Status: item.status,
    });
    setParameterTicketDetail({
      ClientId: item.client_id,
      TicketId: item.id,
      ClientFName: item.first_name,
      ClientLName: item.last_name,
      ClientEmail: item.email,
      ClientMobile: item.phone_no_1,
    });
    selectSheet.current.open();
  }

  /**
   * Set param convertToInvoice
   */

  function convertToInvoice() {
    navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen, {
      ClientId: parameter.ClientId,
      TicketId: parameter.TicketId,
      ClientFName: parameter.ClientFName,
      ClientLName: parameter.ClientLName,
      ClientEmail: parameter.ClientEmail,
      ClientMobile: parameter.ClientMobile,
      TicketDescription: parameter.TicketDescription,
      TicketTypeId: parameter.TicketTypeId,
      Status: parameter.Status,
    });
    selectSheet.current.close();
  }

  /**
   * Set param convertToInvoice
   */

  function EditTicket() {
    navigation.navigate(NAVIGATION_STRING_CONSTANTS.edit_ticket_screen, {
      _Id: parameterEditTicket._Id,
      Client_Id: parameterEditTicket.Client_Id,
      Ticket_TypeId: parameterEditTicket.Ticket_TypeId,
      Ticket_Date: parameterEditTicket.Ticket_Date,
      Client_FName: parameterEditTicket.Client_FName,
      Client_LName: parameterEditTicket.Client_LName,
      Ticket_TypeName: parameterEditTicket.Ticket_TypeName,
      ClientEmail: parameterEditTicket.ClientEmail,
      ClientMobile: parameterEditTicket.ClientMobile,
      TicketNotes: parameterEditTicket.TicketNotes,
    });
    selectSheet.current.close();
  }

  /**
   * Set param convertToInvoice
   */

  function TicketDetail() {
    navigation.navigate(NAVIGATION_STRING_CONSTANTS.download_screen, {
      ClientId: parameterTicketDetail.ClientId,
      TicketId: parameterTicketDetail.TicketId,
      ClientFName: parameterTicketDetail.ClientFName,
      ClientLName: parameterTicketDetail.ClientLName,
      ClientEmail: parameterTicketDetail.ClientEmail,
      ClientMobile: parameterTicketDetail.ClientMobile,
    });
    selectSheet.current.close();
  }

  /**
   * when user refresh screen
   */

  function refreshingFunction() {
    setRefreshing(true);
    if (selectTab == 0) {
      getDataOnScreen((value = 'schedule'));
    } else if (selectTab == 1) {
      getDataOnScreen((value = 'closed'));
    } else if (selectTab == 2) {
      getDataOnScreen((value = ''));
    } else if (selectTab == 3) {
      getDataOnScreen((value = 'decline'));
    } else if (selectTab == 4) {
      getDataOnScreen((value = 'suspend'));
    }
  }

  /**
   * Set param convertToInvoice
   */

  function returnSheet() {
    if (parameter) {
      return (
        <>
          {parameter.Status == 0 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => convertToInvoice()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => EditTicket()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.edit_ticket}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 1 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => convertToInvoice()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => EditTicket()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.edit_ticket}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 2 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => TicketDetail()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 3 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.decline_ticket_alert_box) +
                  selectSheet.current.close()
                }>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.decline_ticket_alert_box) +
                  selectSheet.current.close()
                }>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 4 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.locked_ticket_alert_box) +
                  selectSheet.current.close()
                }>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => TicketDetail() + selectSheet.current.close()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 5 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => convertToInvoice()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.GoDetailBottomSheetButton}
                onPress={() => TicketDetail()}>
                <Text style={styles.BottomSheetButtonText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.BottomSheetImages}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }
  }

  /**
   * Loader component
   */

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
                size={'large'}
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
        onPress={() => Param(item)}
        style={styles.ClientBoxContainer}>
        <Text style={styles.ClientNameText}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.ClientDetailText}>
          {item.ticket_type_description}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.ClientDetailText}>{item.date}</Text>

          {item.status == 1 && (
            <View
              style={{
                backgroundColor: '#5DBF06',
                paddingHorizontal: 18,
                textAlign: 'center',
                paddingVertical: 2,
                borderRadius: 15,
                width: 140,
              }}>
              <Text style={styles.StatusText}>{STRING_CONSTANTS.schedule}</Text>
            </View>
          )}
          {item.status == 2 && (
            <View
              style={{
                backgroundColor: '#f1b53d',
                paddingHorizontal: 18,
                textAlign: 'center',
                paddingVertical: 2,
                borderRadius: 15,
                width: 140,
              }}>
              <Text style={styles.StatusText}>{STRING_CONSTANTS.close}</Text>
            </View>
          )}
          {item.status == 3 && (
            <View
              style={{
                backgroundColor: '#ff5d48',
                paddingHorizontal: 18,
                textAlign: 'center',
                paddingVertical: 2,
                borderRadius: 15,
                width: 140,
              }}>
              <Text style={styles.StatusText}>{STRING_CONSTANTS.decline}</Text>
            </View>
          )}
          {item.status == 4 && (
            <View
              style={{
                backgroundColor: 'rgb(9, 120, 184)',
                paddingHorizontal: 18,
                textAlign: 'center',
                paddingVertical: 2,
                borderRadius: 15,
                width: 140,
              }}>
              <Text style={styles.StatusText}>Locked</Text>
            </View>
          )}

          {item.status == 5 && (
            <View
              style={{
                backgroundColor: '#1bb99a',
                paddingHorizontal: 18,
                textAlign: 'center',
                paddingVertical: 2,
                borderRadius: 15,
                width: 140,
              }}>
              <Text style={styles.StatusText}>
                {' '}
                {STRING_CONSTANTS.suspend}{' '}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.ClientDetailText,
            {color: '#333333', fontSize: 11, fontFamily: 'DMSans-BoldItalic'},
          ]}>
          {item.ticket_notes}
        </Text>
      </TouchableOpacity>
    );
  };

  const ItemSeparatorView = () => {
    return <></>;
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {windowWidth > 700 ? (
        <View style={styles.SwitchSelectorMainContainer}>
          <View style={styles.SwitchSelectorContainer}>
            <TouchableOpacity
              style={{
                width: '20%',
                height: 35,
                backgroundColor: selectTab == 0 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'schedule')) + setSelectTab(0)
              }>
              <Text
                style={{
                  color: selectTab == 0 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.schedule}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '20%',
                height: 35,
                backgroundColor: selectTab == 1 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'closed')) + setSelectTab(1)
              }>
              <Text
                style={{
                  color: selectTab == 1 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.close}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '20%',
                height: 35,
                backgroundColor: selectTab == 4 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'suspend')) + setSelectTab(4)
              }>
              <Text
                style={{
                  color: selectTab == 4 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.suspend}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '20%',
                height: 35,
                backgroundColor: selectTab == 3 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'decline')) + setSelectTab(3)
              }>
              <Text
                style={{
                  color: selectTab == 3 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.decline}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '20%',
                height: 35,
                backgroundColor: selectTab == 2 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => getDataOnScreen((value = '')) + setSelectTab(2)}>
              <Text
                style={{
                  color: selectTab == 2 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.all}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.SwitchSelectorMainContainer}>
          <View style={styles.SwitchSelectorContainer}>
            <TouchableOpacity
              style={{
                width: '30%',
                height: 35,
                backgroundColor: selectTab == 0 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'schedule')) + setSelectTab(0)
              }>
              <Text
                style={{
                  color: selectTab == 0 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.schedule}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '30%',
                height: 35,
                backgroundColor: selectTab == 1 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'closed')) + setSelectTab(1)
              }>
              <Text
                style={{
                  color: selectTab == 1 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.close}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '30%',
                height: 35,
                backgroundColor: selectTab == 2 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => getDataOnScreen((value = '')) + setSelectTab(2)}>
              <Text
                style={{
                  color: selectTab == 2 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.all}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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

      <TouchableOpacity
        style={styles.FloatingButton}
        onPress={() =>
          navigation.navigate(NAVIGATION_STRING_CONSTANTS.create_ticket_screen)
        }>
        <Image
          style={styles.ImageFloatingButton}
          source={require('./assets/FloatingButton.png')}
        />
      </TouchableOpacity>
      <RBSheet
        ref={selectSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={250}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
        }}>
        {returnSheet()}
      </RBSheet>
      <BottomTabBarTicket />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ClientBoxContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginVertical: 5,
    borderColor: '#B2B9BF',
    borderWidth: 0.5,
    borderRadius: 3,
    padding: 10,
  },
  ClientNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  ClientDetailText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  StatusText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
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
  ImageFloatingButton: {
    resizeMode: 'contain',
    height: 55,
    width: 55,
  },
  SwitchSelectorMainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  SwitchSelectorContainer: {
    width: '100%',
    height: 45,
    borderWidth: 0.5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#cccccc',
    paddingHorizontal: 5,
  },
  GoDetailBottomSheetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 25,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 2,
  },
  BottomSheetButtonText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  BottomSheetImages: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default DetailsScreen;
