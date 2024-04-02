import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  TouchableOpacity,
  Alert,
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  BackHandler,
  Platform,
  Modal,
} from 'react-native';
import URL_CONFIG from './Components/global-config';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './Components/BottomTabBar';
import STRING_CONSTANTS from './strings/strings';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {Dimensions} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';

const Create_Ticket = () => {
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const clientListRBSheet = useRef(null);
  const ticketsType = useRef(null);

  ////  API and validation ////

  const [client_id, setClientId] = useState();
  const [ticket_type_id, setTicketTypeId] = useState();
  const [date, setDate] = useState();
  const [formType, setFormType] = useState();
  const [ticket_type_name, setTicketTypeName] = useState();
  const [clientName, setClientName] = useState();
  const [ticketNotes, setTicketNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState();
  const [refreshing, setRefreshing] = useState(false);

  // client name fetch
  const [clientNameData, setClientNameData] = useState([]);
  const [ticketTypeData, setTicketTypeData] = useState([]);

  //searchQuery
  const [searchQuery, setSearchQuery] = useState('');
  const [query, setQuery] = useState('');
  const [loadData, setLoadData] = useState(false);
  const [moreDataLoading, setMoreDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [productsModal, setProductsModal] = useState(false);

  const toggleProductsModal = () => {
    setProductsModal(!productsModal);
  };

  // Passing parameters variable
  const Client_Save = 'save';
  const onScreenLoad = () => {
    setFormType(Client_Save);
  };

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    clientNameFetchData();
    onScreenLoad();
    updateDate(new Date());
    ticketType();
    setCurrentPage(1);
    setMoreDataLoading(false);
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
      clientNameFetchData();
      onScreenLoad();
      updateDate(new Date());
      ticketType();
      if (Platform.OS === 'ios') {
        showMode('date');
      }
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
   * Api Submit button (Save & Change) Api
   */

  const Submit = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    if (!client_id) {
      setErrorMessage(STRING_CONSTANTS.client_required);
    } else if (!ticket_type_id) {
      setErrorMessage(STRING_CONSTANTS.ticket_type_required);
    } else if (!date || date == '') {
      setErrorMessage('Please Select Date');
    } else {
      setRefreshing(true);
      toggleProductsModal();
      fetch(URL_CONFIG.Url + 'api/tickets/save', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          client_id: client_id,
          ticket_type_id: ticket_type_id,
          date: date,
          ticket_notes: ticketNotes,
          formType: formType,
        }),
      })
        .then(response => response.json())
        .then(async data => {
          setRefreshing(false);
          toggleProductsModal();
          if (data.success == true) {
            console.log(data);
            navigation.navigate('Root', {
              screen: NAVIGATION_STRING_CONSTANTS.details_screen,
            });
          } else {
            console.log(data.message);
            Alert.alert(error.message);
          }
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  // Api Submit button End

  /**
   * create ticket date picker
   */

  const updateDate = date => {
    setInvoiceDate(date);
    var separator = '-';
    var _d =
      date.getFullYear() +
      separator +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      separator +
      date.getDate().toString().padStart(2, '0');
    setDate(_d);
  };
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const invoiceDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || invoiceDate;
    setShow(Platform.OS === 'ios');
    setInvoiceDate(currentDate);
    updateDate(new Date(currentDate));
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  //// React native Ios Date Picker Functions ////
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePickerIos = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = date => {
    var separator = '-';
    var _d =
      date.getFullYear() +
      separator +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      separator +
      date.getDate().toString().padStart(2, '0');
    setDate(_d);
    setSelectedDate(date);
    hideDatePicker();
  };
  //// End ////

  function showDatePicker() {
    if (Platform.OS === 'ios') {
      return (
        <>
          <Text style={styles.InputFieldLabelText}>Date</Text>
          <TouchableOpacity
            onPress={showDatePickerIos}
            style={styles.MainContainerDatePicker}>
            <Text
              style={{
                color: '#333333',
                fontSize: 16,
                margin: 10,
                fontFamily: 'DMSans-Medium',
              }}>
              {date}
            </Text>
            <DateTimePickerModal
              date={selectedDate}
              isVisible={datePickerVisible}
              mode="date"
              //display="inline"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <TouchableOpacity onPress={showDatePickerIos}>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/calendar.png')}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.InputFieldLabelText}>Date</Text>
          <TouchableOpacity
            onPress={() => showMode('date')}
            style={styles.MainContainerDatePicker}>
            <Text style={styles.DateText}>{date}</Text>
            <TouchableOpacity onPress={() => showMode('date')}>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/calendar.png')}
              />
            </TouchableOpacity>
            {show && (
              <RNDateTimePicker
                value={invoiceDate}
                mode={mode}
                is24Hour={true}
                display={'default'}
                onChange={invoiceDateOnChange}
              />
            )}
          </TouchableOpacity>
        </>
      );
    }
  }

  // Date Picker End

  // Client Name Fetch
  const clientNameFetchData = async pagination_page => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    if (searchQuery) {
    } else {
      setMoreDataLoading(true);
      fetch(
        URL_CONFIG.Url +
          `api/clients?search= ${query}&page= ${pagination_page}`,
        options,
      )
        .then(response => response.json())
        .then(responseJson => {
          const newData = responseJson;
          if (newData.success == true) {
            if (newData.clients.data.length <= 0) {
              console.log(newData.clients.data);
              setMoreDataLoading(false);
              setLoadData(true);
            } else {
              setClientNameData([...clientNameData, ...newData.clients.data]);
              setMoreDataLoading(false);
            }
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
    }
  };
  // Client Name Fetch End

  /**
   * Fetch Client List Search bar
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
              // console.log(newData.clients.data);
              setClientNameData(newData.clients.data);
            } else if (newData.success == false) {
              Alert.alert(newData.message);
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
            }
          })
          .catch(error => {
            console.warn(error);
          });
      }, 200);
    } else if (text.length < 1) {
      fetch(URL_CONFIG.Url + `api/clients?search=${text}`, options)
        .then(response => response.json())
        .then(responseJson => {
          const newData = responseJson;
          if (newData.success == true) {
            // console.log(data.clients.data);
            setClientNameData(newData.clients.data);
          } else if (newData.success == false) {
            Alert.alert(newData.message);
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          }
        })
        .catch(error => {
          console.warn(error);
        });
      setCurrentPage(1);
      setLoadData(false);
    }
  };

  /**
   * Fetch Tickets Type
   */
  const ticketType = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    fetch(URL_CONFIG.Url + `api/tickets/types`, options)
      .then(response => response.json())
      .then(responseJson => {
        const data = responseJson;
        if (data.success == true) {
          setTicketTypeData(data.ticket_types);
          // console.log(data.ticket_types);
        } else if (data.success == false) {
          if (data.status_code == 401) {
            AsyncStorage.clear();
            Alert.alert(data.message);
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.login_screen);
          }
        }
      })
      .catch(error => {
        console.warn(error);
      });
  };

  /**
   * Select Tickets Type
   */

  function selectClientName(item) {
    setClientName(item.fname + ' ' + item.lname);
    setClientId(item.id);
    setErrorMessage('');
    clientListRBSheet.current.close();
  }

  /**
   * Select Tickets Type
   */

  function selectTicketType(item) {
    setTicketTypeId(item.id);
    setTicketTypeName(item.des);
    setErrorMessage('');
    ticketsType.current.close();
  }

  /**
   * Return error Message
   */

  function messageReturn() {
    if (errorMessage) {
      return <Text style={styles.ErrorMessage}>{errorMessage}</Text>;
    }
  }

  const renderFooter = () => {
    return (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator animating size="large" color="#5dbf06" />
      </View>
    );
  };

  const handleLoadMore = () => {
    var pagination_page = currentPage; 
    if (loadData == false) {
      if (moreDataLoading == false) {
        pagination_page += 1; 
        setCurrentPage(pagination_page);
        clientNameFetchData(pagination_page);
      }
    }
  };

  function openClientBottomSheet() {
    setCurrentPage(0);
    setClientNameData([]);
    clientNameFetchData();
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <ScrollView>
        <View style={styles.MainContainer}>
          <Text style={styles.TittleScreen}>
            {STRING_CONSTANTS.create_ticket_title}
          </Text>
          <Text style={styles.InputFieldLabelText}>
            {STRING_CONSTANTS.client_name_label}
          </Text>

          {/* client name BottomSheet */}
          {client_id ? (
            <TouchableOpacity
              style={styles.ClientFieldView}
              onPress={() =>
                clientListRBSheet.current.open() + openClientBottomSheet
              }>
              <Text style={styles.SelectClientAndTicketField}>
                {clientName}
              </Text>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/DropDown.png')}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.ClientFieldView}
              onPress={() => clientListRBSheet.current.open()}>
              <Text style={styles.SelectClientAndTicketField}>
                {STRING_CONSTANTS.select_client_bottom_sheet_title}
              </Text>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/DropDown.png')}
              />
            </TouchableOpacity>
          )}
          {/* client name BottomSheet End */}

          <Text style={styles.InputFieldLabelText}>
            {STRING_CONSTANTS.ticket_type_label}
          </Text>
          {ticket_type_id ? (
            <TouchableOpacity
              style={styles.ClientFieldView}
              onPress={() => ticketsType.current.open()}>
              <Text style={styles.SelectClientAndTicketField}>
                {ticket_type_name}
              </Text>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/DropDown.png')}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.ClientFieldView}
              onPress={() => ticketsType.current.open()}>
              <Text style={styles.SelectClientAndTicketField}>
                {STRING_CONSTANTS.select_ticket_button_title}
              </Text>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/DropDown.png')}
              />
            </TouchableOpacity>
          )}
          {/* Date Picker */}
          {showDatePicker()}

          <TextInput
            autoCorrect={false}
            placeholder="Note"
            placeholderTextColor="#999999"
            value={ticketNotes}
            onChangeText={text => {
              setTicketNotes(text);
            }}
            style={{
              flex:1,
              borderRadius: 5,
              borderWidth: 1,
              backgroundColor: '#fff',
              color: 'black',
              fontSize: 16,
              borderColor: '#B2B9BF',             
              fontFamily: 'DMSans-Medium',
              padding: 15,
              marginVertical:10
            }}
          />

          {messageReturn()}
          <TouchableOpacity
            style={styles.CreateButtonStyle}
            onPress={() => Submit()}>
            <Text style={styles.ButtonText}>
              {STRING_CONSTANTS.create_ticket_button_label}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ButtonStyleCancel}
            onPress={() => navigation.goBack()}>
            <Text style={styles.ButtonText}>
              {STRING_CONSTANTS.cancel_button_label}
            </Text>
          </TouchableOpacity>
        </View>
        <RBSheet
          ref={clientListRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={windowWidth > 700 ? 750 : 600}
          customStyles={{
            wrapper: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
            draggableIcon: {
              backgroundColor: '#000',
            },
          }}>
          <View style={styles.MainContainerClientList}>
            <Text style={styles.ClientBottomSheetTittle}>
              {STRING_CONSTANTS.select_client_bottom_sheet_title}
            </Text>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={'#666666'}
              style={styles.ClientSearchBar}
              value={searchQuery}
              onChangeText={text => {
                SearchFetch(text);
                setSearchQuery(text);
              }}
            />
            <FlatList
              data={clientNameData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <>
                  <TouchableOpacity
                    style={styles.ClientDataViewBox}
                    onPress={() => selectClientName(item)}>
                    <View style={styles.ClientDataBox}>
                      <View style={styles.DataViewClientList}>
                        <Text style={styles.ClientNameText}>
                          {item.fname} {item.lname}
                        </Text>
                        <Text style={styles.ClientDataText}>
                          +{item.phone_no_1}
                        </Text>
                        <Text style={styles.ClientDataText}>{item.email}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={moreDataLoading ? renderFooter : null}
            />
          </View>
        </RBSheet>
        <RBSheet
          ref={ticketsType}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={450}
          customStyles={{
            wrapper: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
            draggableIcon: {
              backgroundColor: '#000',
            },
          }}>
          <View style={styles.MainContainerClientList}>
            {/* <Text style={styles.Tittle}>Select Ticket Type</Text> */}
            <FlatList
              data={ticketTypeData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <>
                  <View style={{flex: 1, justifyContent: 'center'}}>
                    <TouchableOpacity
                      style={styles.TicketTypeListButtons}
                      onPress={() => selectTicketType(item)}>
                      <Text style={styles.TicketTypeListText}>{item.des}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            />
          </View>
        </RBSheet>
      </ScrollView>
      <View style={{flex: 1}}>
        <Modal animationType="fade" transparent={true} visible={productsModal}>
          {/* onRequestClose={() => toggleProductsModal()} */}
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
      {/* BOTTOM TAB BAR */}
      <BottomTabBar />
    </SafeAreaView>
  );
};
export default Create_Ticket;
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  ClientBottomSheetTittle: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  TittleScreen: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  InputFieldLabelText: {
    color: '#808080',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginTop: 18,
    marginLeft: 5,
  },
  MainContainerDatePicker: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderRadius: 5,
    width: '100%',
    margin: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#B2B9BF',
  },
  DateText: {
    color: '#333333',
    fontSize: 16,
    margin: 10,
    fontFamily: 'DMSans-Medium',
  },
  CreateButtonStyle: {
    backgroundColor: '#5DBF06',
    borderWidth: 1,
    borderColor: '#7DE24E',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 40,
  },
  ButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
  },
  ButtonStyleCancel: {
    backgroundColor: '#D65F1C',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 20,
  },
  SelectClientAndTicketField: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  ClientFieldView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    marginTop: 10,
  },
  ErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  MainContainerClientList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  ClientSearchBar: {
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAEAEA',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#444444',
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  ClientDataText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  ClientDataViewBox: {
    margin: 5,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    borderColor: '#cccccc',
    borderRadius: 5,
  },
  DataViewClientList: {
    flexDirection: 'column',
  },
  ClientDataBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#cccccc',
  },
  ClientNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  TicketTypeListButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginVertical: 5,
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
  TicketTypeListText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
});
