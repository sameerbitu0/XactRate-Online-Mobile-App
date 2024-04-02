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
  Modal,
  Platform,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import URL_CONFIG from './Components/global-config';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './Components/BottomTabBar';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import {Dimensions} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';

const Edit_Ticket = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const route = useRoute();
  const navigation = useNavigation();
  const clientListRBSheet = useRef(null);
  const ticketsType = useRef(null);

  ////  API   and validation ////
  const [id, setId] = useState();
  const [client_id, setClientId] = useState();
  const [ticket_type_id, setTicketTypeId] = useState();
  const [date, setDate] = useState();
  const [clientName, setClientName] = useState();
  const [ticket_type_name, setTicketTypeName] = useState([]);
  const [ticketNotes, setTicketNotes] = useState('');


  const [errorMessage, setErrorMessage] = useState();

  // client name fetch
  const [clientNameData, setClientNameData] = useState([]);
  const [ticketTypeData, setTicketTypeData] = useState([]);

  //searchQuery
  const [searchQuery, setSearchQuery] = useState('');
  const [loadData, setLoadData] = useState(false);
  const [moreDataLoading, setMoreDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Passing parameters variable
  const {
    _Id,
    Client_Id,
    Ticket_TypeId,
    Ticket_Date,
    Client_FName,
    Client_LName,
    Ticket_TypeName,
    TicketNotes,
    ClientEmail,
    ClientMobile,
  } = route.params ?? {};

  const Client_Save = 'update';

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    var current = new Date(Ticket_Date+' '+'10:00:00');
    setSelectedDate(current);
    onScreenLoad();
    ticketType();
    clientNameFetchData();
    setCurrentPage(1);
    setClientNameData([]);
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
      var current = new Date(Ticket_Date+' '+'10:00:00');
      setSelectedDate(current);
      onScreenLoad();
      ticketType();
      clientNameFetchData();

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

  const onScreenLoad = () => {
    setId(_Id);
    setClientId(Client_Id);
    setTicketTypeId(Ticket_TypeId);
    setDate(Ticket_Date);
    setTicketTypeName(Ticket_TypeName);
    setClientName(Client_FName + ' ' + Client_LName);
    setTicketNotes(TicketNotes);
  };

  // Passing parameters variable End

  /**
   * Fetch client name list from api
   */

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
   * submit function ticket edit api
   */

  const Submit = async () => {
    var _body = {
      id: id,
      client_id: client_id,
      ticket_type_id: ticket_type_id,
      date: date,
      ticket_notes: ticketNotes,
      formType: Client_Save,
    };
    var userToken = await AsyncStorage.getItem('userToken');

    if (!id && !client_id) {
      setErrorMessage(STRING_CONSTANTS.client_fname_required);
    }
    if (!ticket_type_id) {
      setErrorMessage(STRING_CONSTANTS.ticket_type_required);
    }
    if (!date || date == '') {
      setErrorMessage('Please Select Date');
    } else {
      setLoading(true);
      fetch(URL_CONFIG.Url + 'api/tickets/save', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(_body),
      })
        .then(response => response.json())
        .then(async data => {
          setLoading(false);
          if (data.success == true) {
            navigation.navigate('Root', {
              screen: NAVIGATION_STRING_CONSTANTS.details_screen,
            });
          } else {
            console.log(data.message);
          }
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  /**
   * Ticket remove and delete from list function
   */

  const RemoveItem = async item => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: _Id,
      }),
    };
    setLoading(true);
    fetch(URL_CONFIG.Url + 'api/tickets/delete/' + _Id, options)
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        navigation.navigate(NAVIGATION_STRING_CONSTANTS.details_screen);
      })
      .catch(error => {
        console.warn(error);
      });
  };

  const AlertPermission = item =>
    Alert.alert(
      STRING_CONSTANTS.default_alert_box_tittle,
      STRING_CONSTANTS.delete_ticket_alert_box,
      [
        {
          text: 'Cancel',
          onPress: () => '',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => RemoveItem(item),
        },
      ],
    );
  ////  API Fetch  Delete End   ////

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
            const data = responseJson;
            if (data.success == true) {
              // console.log(data.clients.data);
              setClientNameData(data.clients.data);
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
   * Date picker
   */

  const updateDate = date => {
    setEditTicketDate(date);
    var separator = '-';
    var _d =
      date.getFullYear() +
      separator +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      separator +
      date.getDate().toString().padStart(2, '0');
    setDate(_d);
  };
  const [editTicketDate, setEditTicketDate] = useState(new Date(Ticket_Date));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const editTicketDateOnChange = (event, selectedDate) => {
    const Ticket_Date = selectedDate || editTicketDate;
    setShow(Platform.OS === 'ios');
    setEditTicketDate(Ticket_Date);
    updateDate(new Date(Ticket_Date));
  };

  const showMode = Ticket_Date => {
    setShow(true);
    setMode(Ticket_Date);
  };
  // Date Picker End

  //// React native Ios Date Picker Functions ////

  const [selectedDate, setSelectedDate] = useState(new Date(Ticket_Date));
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

  /**
   * Select Client Name
   */

  function selectClientName(item) {
    setClientName(item.fname + ' ' + item.lname);
    setClientId(item.id);
    clientListRBSheet.current.close();
  }

  /**
   * Select Tickets Type
   */

  function selectTicketType(item) {
    setTicketTypeId(item.id);
    setTicketTypeName(item.des);
    ticketsType.current.close();
  }

  /**
   * FlatList more data load loader Component
   */

  const renderFooter = () => {
    return (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator animating size="large" color="#5dbf06" />
      </View>
    );
  };

  /**
   * Push to fetch data function
   */
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

  /**
   * on press open client name bottom sheet
   */
  function openClientBottomSheet() {
    clientListRBSheet.current.open();
    setCurrentPage(1);
    setClientNameData([]);
    clientNameFetchData();
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <Text style={styles.ScreenTittle}>Edit Ticket</Text>
      <ScrollView>
        <View style={styles.MainContainer}>
          <Text style={styles.InputFieldLabelText}>
            {STRING_CONSTANTS.client_name_label}
          </Text>
          <TouchableOpacity
            style={styles.SelectClientAndTicketView}
            onPress={() => openClientBottomSheet()}>
            <Text style={styles.ClientAndTicketOpenButton}>{clientName}</Text>
            <Image
              style={{
                height: 35,
                width: 35,
                resizeMode: 'contain',
                tintColor: 'black',
              }}
              source={require('./assets/DropDown.png')}
            />
          </TouchableOpacity>
          <Text style={styles.InputFieldLabelText}>
            {STRING_CONSTANTS.ticket_type_label}
          </Text>
          <TouchableOpacity
            style={styles.SelectClientAndTicketView}
            onPress={() => ticketsType.current.open()}>
            <Text style={styles.ClientAndTicketOpenButton}>
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
          {Platform.OS === 'ios' ? (
            <>
              <Text style={styles.InputFieldLabelText}>Date</Text>
              <TouchableOpacity
                onPress={showDatePickerIos}
                style={styles.MainContainerDatePicker}>
                <Text style={styles.DateText}>
                {date}
                </Text>
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
                <DateTimePickerModal
                  date={selectedDate}
                  isVisible={datePickerVisible}
                  mode="date"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}                  
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Date Picker */}
              <Text style={styles.InputFieldLabelText}>Date</Text>
              <View style={styles.MainContainerDatePicker}>
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
                    testID="dateTimePicker"
                    value={editTicketDate}
                    mode={mode}
                    is24Hour={true}
                    display={'default'}
                    onChange={editTicketDateOnChange}
                  />
                )}
              </View>
            </>
          )}
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

          {/* Date Picker End */}
          <Text style={styles.ErrorMessage}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.DeleteTicketButtonStyle}
            onPress={() => AlertPermission()}>
            <Image
              style={styles.DeleteTicketImage}
              source={require('./assets/close.png')}
            />
            <Text style={styles.DeleteTicketText}>
              {STRING_CONSTANTS.delete_ticket}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.CreateButtonStyle}
            onPress={() => Submit()}>
            <Text style={styles.ButtonText}>
              {STRING_CONSTANTS.save_ticket}
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
            <Text style={styles.TittleClientBottomSheet}>
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
                    <View style={styles.ImageView}>
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
            <FlatList
              data={ticketTypeData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <>
                  <View style={{flex: 1, justifyContent: 'center'}}>
                    <TouchableOpacity
                      style={styles.TicketTypeListButton}
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
        <Modal animationType="fade" transparent={true} visible={loading}>
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
export default Edit_Ticket;
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  ScreenTittle: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    margin: 20,
    textAlign: 'center',
  },
  MainContainerClientList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  TittleClientBottomSheet: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    paddingHorizontal: 20,
  },
  InputFieldLabelText: {
    color: '#808080',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginTop: 15,
    marginLeft: 5,
  },
  MainContainerDatePicker: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    width: '100%',
    margin: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  DateText: {
    color: '#333333',
    fontSize: 16,
    margin: 10,
    fontFamily: 'DMSans-Medium',
  },
  CreateButtonStyle: {
    backgroundColor: '#5dbf06',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
  },
  ButtonStyleCancel: {
    backgroundColor: '#D65F1C',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
  },
  DeleteTicketButtonStyle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#cccccc',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  DeleteTicketText: {
    color: '#F44336',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
  },
  DeleteTicketImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#F44336',
    marginHorizontal: 10,
  },
  ButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
  },
  ErrorMessage: {
    margin: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'serif',
    fontSize: 12,
  },
  ClientAndTicketOpenButton: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  SelectClientAndTicketView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
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
    marginVertical: 10,
    marginHorizontal: 20,
  },
  ClientDataText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },
  ClientDataViewBox: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    borderColor: '#cccccc',
    borderBottomWidth: 1,
  },
  DataViewClientList: {
    flexDirection: 'column',
  },
  ClientNameText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  TicketTypeListButton: {
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
