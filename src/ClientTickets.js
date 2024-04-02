import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './Components/BottomTabBar';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import URL_CONFIG from './Components/global-config';
import {Dimensions} from 'react-native';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const ClientTickets = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');
  const SelectSheet = useRef(null);

  // Passing parameters variable
  const {ClientId, ClientFName, ClientLName, ClientEmail, ClientMobile} =
    route.params;
  const [selectTab, setSelectTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);
  const [status, setStatus] = useState(0);

  const [parameter, setParameter] = useState();
  const [parameterEditTicket, setParameterEditTicket] = useState();
  const [parameterTicketDetail, setParameterTicketDetail] = useState();

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    setIsListEnd(false);
    setOffset(1);
    setSelectTab(1);
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

  useFocusEffect(
    useCallback(() => {
      setIsListEnd(false);
      setOffset(1);
      setSelectTab(1);
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
   * Set param in variable
   */

  function Param(item) {
    setParameter({
      ClientId: ClientId,
      TicketId: item.id,
      ClientFName: ClientFName,
      ClientLName: ClientLName,
      ClientEmail: ClientEmail,
      ClientMobile: ClientMobile,
      TicketDescription: item.ticket_type_description,
      TicketTypeId: item.ticket_type_id,
      Status: item.status,
    });
    setParameterEditTicket({
      _Id: item.id,
      Client_Id: ClientId,
      Ticket_TypeId: item.ticket_type_id,
      Ticket_Date: item.date,
      Client_FName: ClientFName,
      Client_LName: ClientLName,
      Ticket_TypeName: item.ticket_type_description,
      ClientEmail: ClientEmail,
      Status: item.status,
    });
    setParameterTicketDetail({
      ClientId: ClientId,
      TicketId: item.id,
      ClientFName: ClientFName,
      ClientLName: ClientLName,
      ClientEmail: ClientEmail,
      ClientMobile: ClientMobile,
    });
    SelectSheet.current.open();
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
    SelectSheet.current.close();
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
    });
    SelectSheet.current.close();
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
    SelectSheet.current.close();
  }

  /**
   * when user on focus screen fetch ticket data
   */
  async function getDataOnScreen(value) {
    setDataSource();
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
    fetch(
      URL_CONFIG.Url + `api/clients/${ClientId}/tickets?status=${value}&page=0`,
      options,
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.success == true) {
          setOffset(offset + 1);
          setDataSource(responseJson.tickets.data);
          setLoading(false);
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
   * when user on screen load more data
   */

  async function getData() {
    if (!loading && !isListEnd) {
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
      fetch(
        URL_CONFIG.Url +
          `api/clients/${ClientId}/tickets?status=${status}&page=` +
          offset,
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

  const renderFooter = () => {
    return (
      //Footer View with Loader
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator
            color="#5dbf06"
            size={'large'}
            style={{margin: 15}}
          />
        ) : null}
      </View>
    );
  };

  const ItemView = ({item}) => {
    return (
      <TouchableOpacity style={styles.DataBoxView} onPress={() => Param(item)}>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.TypeNameText}>
            {item.ticket_type_description}
          </Text>
          <View style={styles.DataRowView}>
            <Text style={styles.dataText}>{item.date}</Text>

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
                <Text style={styles.StatusText}>
                  {STRING_CONSTANTS.schedule}
                </Text>
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
                <Text style={styles.StatusText}>
                  {STRING_CONSTANTS.decline}
                </Text>
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
                  {STRING_CONSTANTS.suspend}
                </Text>
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
          </View>
        </View>
        <TouchableOpacity onPress={() => Param(item)}></TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const ItemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <></>
    );
  };

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
                style={styles.DeleteTypeBottom}
                onPress={() => convertToInvoice()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => EditTicket()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.edit_ticket}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 1 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => convertToInvoice()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => EditTicket()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.edit_ticket}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 2 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.close_ticket_alert_box) +
                  SelectSheet.current.close()
                }>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => TicketDetail()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 3 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.decline_ticket_alert_box) +
                  SelectSheet.current.close()
                }>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.decline_ticket_alert_box) +
                  SelectSheet.current.close()
                }>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 4 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(STRING_CONSTANTS.locked_ticket_alert_box) +
                  SelectSheet.current.close()
                }>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => TicketDetail()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {parameter.Status == 5 && (
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => convertToInvoice()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.convert_to_invoice}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/convert.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => TicketDetail()}>
                <Text style={styles.EditText}>
                  {STRING_CONSTANTS.ticket_details}
                </Text>
                <Image
                  style={styles.SeeIcon}
                  source={require('./assets/view.png')}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <View style={styles.ClientBoxContainer}>
        <Text style={styles.ClientBoxNameText}>
          {ClientFName} {ClientLName}
        </Text>
        <View style={styles.ClientBoxDetailContainer}>
          <Image
            style={styles.ImageIcon}
            source={require('./assets/Email.png')}
          />
          <Text style={styles.ClientDataDetailText}>{ClientEmail}</Text>
        </View>
        <View style={styles.ClientBoxDetailContainer}>
          <Image
            style={styles.ImageIcon}
            source={require('./assets/Call.png')}
          />
          <Text style={styles.ClientDataDetailText}>+{ClientMobile}</Text>
        </View>
      </View>
      <Text style={styles.Tittle}>Tickets</Text>

      {windowWidth > 700 ? (
        <View style={styles.TabViewContainer}>
          <View style={styles.TabView}>
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
                getDataOnScreen((value = 'schedule')) + setSelectTab(1)
              }>
              <Text
                style={{
                  color: selectTab == 1 ? '#fff' : '#000000',
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
                backgroundColor: selectTab == 2 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'closed')) + setSelectTab(2)
              }>
              <Text
                style={{
                  color: selectTab == 2 ? '#fff' : '#000000',
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
                getDataOnScreen((value = 'decline')) + setSelectTab(4)
              }>
              <Text
                style={{
                  color: selectTab == 4 ? '#fff' : '#000000',
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
                backgroundColor: selectTab == 5 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'suspend')) + setSelectTab(5)
              }>
              <Text
                style={{
                  color: selectTab == 5 ? '#fff' : '#000000',
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
              onPress={() => getDataOnScreen((value = '')) + setSelectTab(3)}>
              <Text
                style={{
                  color: selectTab == 3 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.all}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.TabViewContainer}>
          <View style={styles.TabView}>
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
                getDataOnScreen((value = 'schedule')) + setSelectTab(1)
              }>
              <Text
                style={{
                  color: selectTab == 1 ? '#fff' : '#000000',
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
                backgroundColor: selectTab == 2 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                getDataOnScreen((value = 'closed')) + setSelectTab(2)
              }>
              <Text
                style={{
                  color: selectTab == 2 ? '#fff' : '#000000',
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
                backgroundColor: selectTab == 3 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => getDataOnScreen((value = '')) + setSelectTab(3)}>
              <Text
                style={{
                  color: selectTab == 3 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.all}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {dataSource ? (
        dataSource.length > 0 ? (
          <FlatList
            data={dataSource}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            renderItem={ItemView}
            ListFooterComponent={renderFooter}
            onEndReached={getData}
            onEndReachedThreshold={0.5}
          />
        ) : (
          <View style={{flex: 1, paddingVertical: 20}}>
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
              {STRING_CONSTANTS.no_ticket}
            </Text>
          </View>
        )
      ) : (
        <View style={styles.MainContainer}>
          <ActivityIndicator size={30} color="#000000" />
        </View>
      )}
      <RBSheet
        ref={SelectSheet}
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
      {/* BOTTOM TAB BAR */}
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default ClientTickets;

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    padding: 10,
  },
  ClientBoxContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingVertical: 5,
  },
  ClientBoxNameText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 30,
    padding: 8,
    paddingLeft: 30,
  },
  ClientDataDetailText: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    padding: 8,
    flex: 1,
  },
  ImageIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  ClientBoxDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
  },
  Tittle: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  AllButton: {
    borderWidth: 1,
    paddingLeft: 20,
    paddingRight: 20,
    borderColor: '#5dbf06',
    borderRadius: 5,
    padding: 5,
    margin: 10,
    backgroundColor: '#FFFFFF',
  },
  AllText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },
  DataBoxView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginVertical: 5,
    borderColor: '#B2B9BF',
    borderWidth: 0.5,
    borderRadius: 3,
    padding: 10,
  },
  SeeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  dataText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  DataRowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TypeNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  StatusText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  TabViewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  TabView: {
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
  messageText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
  DeleteTypeBottom: {
    justifyContent: 'space-between',
    flexDirection: 'row',
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
  EditText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
});
