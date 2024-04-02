import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
  BackHandler,
  Platform,
  ActivityIndicator,
  Modal,
  Button,
  KeyboardAvoidingView,
  TouchableHighlight,
} from 'react-native';
import React, {useEffect, useState, useRef, createRef} from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import URL_CONFIG from './Components/global-config';
import {Dimensions} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {DataTable} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';
const MobileInvoice = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');

  const [loading, setLoading] = useState(false);
  const toggleLoading = () => {
    setLoading(!loading);
  };

  ////  API and validation variables ////

  const {
    ClientId,
    ClientFName,
    ClientLName,
    ClientEmail,
    ClientMobile,
    TicketId,
    TicketDescription,
    TicketTypeId,
  } = route.params ?? {};

  // Date Var variable
  const [ticketId, setTicketId] = useState();
  const [ticketTypeId, setTicketTypeId] = useState();
  const [ticketStatus, setTicketStatus] = useState();
  const [ticketDepreciation, setTicketDepreciation] =
    useState(TicketDescription);
  const [date, setDate] = useState();
  const [refreshing, setRefreshing] = useState(false);
  // Invoice Data variable
  const [selectedTimer, setSelectedTimer] = useState('T&D Time');
  // td timer variable
  const [tdSeconds, setTdSeconds] = useState(0);
  const [tdMinutes, setTdMinutes] = useState(0);
  const [tdHours, setTdHours] = useState(0);
  const [isTdActive, setIsTdActive] = useState(false);
  const [tdTimer, setTdTimer] = useState();

  // Job timer variable
  const [jobSeconds, setJobSeconds] = useState(0);
  const [jobMinutes, setJobMinutes] = useState(0);
  const [jobHours, setJobHours] = useState(0);
  const [isJobActive, setIsJobActive] = useState(false);
  const [jobTimer, setJobTimer] = useState();

  // Job timer variable
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [pauseMinutes, setPauseMinutes] = useState(0);
  const [pauseHours, setPauseHours] = useState(0);
  const [isPauseActive, setIsPauseActive] = useState(false);
  const [pauseTimer, setPauseTimer] = useState();

  // Passing parameters variable
  const [clientListData, setClientListData] = useState([]);
  const [ticketTypeData, setTicketTypeData] = useState();
  const [errorMessage, setErrorMessage] = useState(false);
  const [timeSheetView, setTimeSheetView] = useState(false);

  //searchQuery
  const [searchQuery, setSearchQuery] = useState('');
  const [loadData, setLoadData] = useState(false);
  const [moreDataLoading, setMoreDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');

  //conclusion variables
  const [timeSheet, setTimeSheet] = useState(null);
  const [productsTotal, setProductsTotal] = useState();
  const [totalPay, setTotalPay] = useState();
  const [balance, setBalance] = useState();
  const [paymentType, setPaymentType] = useState();
  const [checkNumber, setCheckNumber] = useState(null);
  const [note, setNote] = useState();
  const [signature, setSignature] = useState();
  const [clientId, setClientId] = useState();

  const [invoiceData, setInvoiceData] = useState({
    client: {
      id: '',
      fn: '',
      ln: '',
      email: '',
      phone_no_1: '',
    },
    service_agreements: [],
    products: [],
    ticket_id: TicketId,
    ticketDate: '',
    travel_Time: '',
    jobTime: '',
    total: '',
  });

  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  //Modals variables
  const [productsModal, setProductsModal] = useState(false);

  const [catalogId, setCatalogId] = useState();
  const [ManufacturerName, setManufacturerName] = useState();

  // custom products add variables
  const [productId, setProductId] = useState();
  const [productStatus, setProductStatus] = useState();
  const [productCode, setProductCode] = useState();
  const [description, setDescription] = useState();
  const [qty, setQty] = useState();
  const [amount, setAmount] = useState();
  const [cPErrorMessage, setCPErrorMessage] = useState(false);
  const [editString, setEditString] = useState();

  const [warranty, setWarranty] = useState();
  const [contingencyProduct, setContingencyProduct] = useState();
  const [employeeData, setEmployeeData] = useState([]);
  const [selectEmployees, setSelectEmployees] = useState();
  const [employeeHours, setEmployeeHours] = useState();
  const [employeeCost, setEmployeeCost] = useState();

  //add product
  const toggleProductsModal = () => {
    setProductsModal(!productsModal);
  };

  // add product Employee //
  const toggleAddEmployeeModal = () => {
    setCustomProduct(false);
    setAddEmployee(true);
  };

  //// Variable initialization  ////
  const [CatalogData, setCatalogData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [serviceAgreementData, setServiceAgreementData] = useState();

  const onScreenLoad = () => {
    setInvoiceClient({
      id: ClientId,
      fname: ClientFName,
      lname: ClientLName,
      email: ClientEmail,
      phone_no_1: ClientMobile,
    });
    updateInvoice();
    if (TicketId) {
      setTicketId(TicketId);
    } else {
      setTicketId(null);
    }
    setTicketTypeId(TicketTypeId);
  };

  /**
   * Sets the client for the current invoice. Needs an object containing client info
   * @param {*} client
   */

  function setInvoiceClient(client) {
    setClientId(client.id);
    invoiceData.client.id = client.id;
    invoiceData.client.fn = client.fname;
    invoiceData.client.ln = client.lname;
    invoiceData.client.email = client.email;
    invoiceData.client.phone_no_1 = client.phone_no_1;
    saveInvoiceData();
    setErrorMessage('');
  }

  /**
   * Triggers on screen load
   */

  useEffect(() => {
    clientNameFetchData();
    ticketType();
    updateDate(new Date());
    setClientListData([]);
    onScreenLoad();
    getInvoiceData();
    updateInvoice();
    startTdTimePop();
    changeOrientation();
    warrantyPercentage();
    fetchServiceAgreementData();
    FetchEmployeeData();
    FetchCatalogData();
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
  }, []);

  /**
   * Triggers when screen is focused
   */

  useFocusEffect(
    React.useCallback(() => {
      getInvoiceData();
      updateInvoice();
      clientNameFetchData();
      setClientListData([]);
      changeOrientation();
      warrantyPercentage();
      fetchServiceAgreementData();
      FetchEmployeeData();
      FetchCatalogData();
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
   * get show pop when user on invoice screen
   */

  function startTdTimePop() {
    if (invoiceData.client.id) {
      if (tdTimer) {
      } else {
        Alert.alert(
          STRING_CONSTANTS.default_alert_box_tittle,
          STRING_CONSTANTS.auto_start_timer_alert_box,
          [
            {
              text: 'No',
              onPress: () => '',
              style: 'no',
            },
            {text: 'Yes', onPress: () => startTdTime()},
          ],
        );
      }
    }
  }

  /**
   * ticket status change function
   */

  function ticketStatusChangeAlertBox(status) {
    if (status == 'lock') {
      Alert.alert(
        STRING_CONSTANTS.default_alert_box_tittle,
        'Do you want to locked ticket ?',
        [
          {
            text: 'No',
            onPress: () => '',
            style: 'no',
          },
          {text: 'Yes', onPress: () => convertToInvoice((locked = 'locked'))},
        ],
      );
    } else if (status == 'suspend') {
      Alert.alert(
        STRING_CONSTANTS.default_alert_box_tittle,
        'Do you want to suspend ticket ?',
        [
          {
            text: 'No',
            onPress: () => '',
            style: 'no',
          },
          {text: 'Yes', onPress: () => ticketSuspend()},
        ],
      );
    } else if (status == 'decline') {
      Alert.alert(
        STRING_CONSTANTS.default_alert_box_tittle,
        'Do you want to decline ticket ?',
        [
          {
            text: 'No',
            onPress: () => '',
            style: 'no',
          },
          {text: 'Yes', onPress: () => ticketDecline()},
        ],
      );
    }
  }

  /**
   * Stores invoice data to Async storage
   */
  async function saveInvoiceData() {
    try {
      AsyncStorage.setItem('invoice', JSON.stringify(invoiceData));
    } catch (error) {
      console.log(error);
    }
    updateInvoice();
  }

  /**
   * Retrieves invoice data from Async storage and sets invoiceData to retrieved value
   */

  const getInvoiceData = async () => {
    var invoice = invoiceData;
    var productsTotal = invoice.products.reduce(
      (acc, item) => acc + parseInt(item.total),
      0,
    );
    var serviceAgreementTotal = invoice.service_agreements.reduce(
      (acc, item) => acc + parseInt(item.serviceAmount),
      0,
    );
    var TotalAmount = productsTotal + serviceAgreementTotal;
    var totalNum = TotalAmount.toFixed(2);
    setProductsTotal(totalNum);
  };
  /**
   * Updates invoice that is displayed after retrieving from Async Storage then invoiceData object
   */

  async function updateInvoice() {
    getInvoiceData();
  }

  /**
   * Fetch Client List Data form api when user select invoice client
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
              setClientListData([...clientListData, ...newData.clients.data]);
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
   * Fetch Client List Search bar Data form api when user select invoice client
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
              // console.log(data.clients.data);
              setClientListData(newData.clients.data);
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
      }, 200);
    } else if (text.length < 1) {
      fetch(URL_CONFIG.Url + `api/clients?search=${text}`, options)
        .then(response => response.json())
        .then(responseJson => {
          const newData = responseJson;
          if (newData.success == true) {
            // console.log(data.clients.data);
            setClientListData(newData.clients.data);
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
      setCurrentPage(1);
      setLoadData(false);
    }
  };

  /**
   * Fetch Tickets Type Data form api when user select invoice client
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
        const newData = responseJson;
        if (newData.success == true) {
          setTicketTypeData(newData.ticket_types);
          // console.log(data.ticket_types);
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
   * Get ticket suspend when user on press suspend button
   */

  const ticketSuspend = async () => {
    toggleLoading();
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    fetch(URL_CONFIG.Url + `api/ticket/suspend?ticket_id=` + TicketId, options)
      .then(response => response.json())
      .then(responseJson => {
        setLoading(false);
        const newData = responseJson;
        if (newData.success == true) {
          navigation.navigate('Root', {
            screen: NAVIGATION_STRING_CONSTANTS.details_screen,
          });
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
   * Get ticket open when user start td timer
   */

  const ticketDecline = async () => {
    toggleLoading();
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    fetch(URL_CONFIG.Url + `api/ticket/decline?ticket_id=` + TicketId, options)
      .then(response => response.json())
      .then(responseJson => {
        setLoading(false);
        const newData = responseJson;
        if (newData.success == true) {
          navigation.navigate('Root', {
            screen: NAVIGATION_STRING_CONSTANTS.details_screen,
          });
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
   * Create Ticket when Select client and than next process
   */
  const selectTicket = async item => {
    setErrorMessage('');
    setTicketTypeId(item.id);
    setTicketDepreciation(item.des);
    setTicketStatus('create_ticket');
    selectTicketRBSheet.current.close();
    startTdTimePop();
  };

  /**
   * Date Picker Invoice
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

  //**** Date Picker End ****//

  /**
   * Timer Set to variable
   */
  function setTimeValues() {
    setTdTimer(
      tdHours.toString().padStart(2, '0') +
        ':' +
        tdMinutes.toString().padStart(2, '0') +
        ':' +
        tdSeconds.toString().padStart(2, '0'),
    );
    setJobTimer(
      jobHours.toString().padStart(2, '0') +
        ':' +
        jobMinutes.toString().padStart(2, '0') +
        ':' +
        jobSeconds.toString().padStart(2, '0'),
    );
    setPauseTimer(
      pauseHours.toString().padStart(2, '0') +
        ':' +
        pauseMinutes.toString().padStart(2, '0') +
        ':' +
        pauseSeconds.toString().padStart(2, '0'),
    );
  }

  /**
   * job and T&D Time Function
   */

  useEffect(() => {
    let interval = null;
    if (isTdActive) {
      interval = setInterval(() => {
        setTdSeconds(tdSeconds => tdSeconds + 1);
      }, 1000);
    } else if (!isTdActive && tdSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTdActive, tdSeconds]);

  const startTdTime = () => {
    setIsTdActive(!isTdActive);
    setIsJobActive(false);
    setIsPauseActive(false);
    setTimeValues();
    if (isTdActive == true || isPauseActive == true || isJobActive == true) {
      if (isTdActive == true) {
        setTimeSheetView(true);
        setTimeSheet('82.52');
        var timeAmount = parseInt(productsTotal) + 83.52;
        var totalAmount = timeAmount.toFixed(2);
        setProductsTotal(totalAmount);
      }
    }
  };

  useEffect(() => {
    if (tdSeconds === 60) {
      setTdSeconds(0);
      setTdMinutes(tdMinutes => tdMinutes + 1);
    }
    if (tdMinutes === 60) {
      setTdMinutes(0);
      setTdHours(TdHours => TdHours + 1);
    }
  }, [tdSeconds, tdMinutes]);

  //**** End ****//

  /**
   * Job Timer Function
   */

  useEffect(() => {
    let interval = null;
    if (isJobActive) {
      interval = setInterval(() => {
        setJobSeconds(jobSeconds => jobSeconds + 1);
      }, 1000);
    } else if (!isJobActive && jobSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isJobActive, jobSeconds]);

  const startJobTime = () => {
    setIsJobActive(!isJobActive);
    setTimeValues();
    setIsPauseActive(false);
    setIsTdActive(false);
    if (isTdActive == true || isPauseActive == true) {
      if (isTdActive == true) {
        setTimeSheetView(true);
        setTimeSheet('82.52');
        var timeAmount = parseInt(productsTotal) + 83.52;
        var totalAmount = timeAmount.toFixed(2);
        setProductsTotal(totalAmount);
      }
    }
  };

  useEffect(() => {
    if (jobSeconds === 60) {
      setJobSeconds(0);
      setJobMinutes(jobMinutes => jobMinutes + 1);
    }
    if (jobMinutes === 60) {
      setJobMinutes(0);
      setJobHours(jobHours => jobHours + 1);
    }
  }, [jobSeconds, jobMinutes]);

  //**** End ****//

  /**
   *  Pause Timer Function
   */

  useEffect(() => {
    let interval = null;
    if (isPauseActive) {
      interval = setInterval(() => {
        setPauseSeconds(pauseSeconds => pauseSeconds + 1);
      }, 1000);
    } else if (!isPauseActive && pauseSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPauseActive, pauseSeconds]);

  const startPauseTime = () => {
    setIsPauseActive(!isPauseActive);
    setTimeValues();
    setIsTdActive(false);
    setIsJobActive(false);
    if (isTdActive == true || isJobActive == true) {
      if (isTdActive == true) {
        setTimeSheetView(true);
        setTimeSheet('82.52');
        var timeAmount = parseInt(productsTotal) + 83.52;
        var totalAmount = timeAmount.toFixed(2);
        setProductsTotal(totalAmount);
        setTdTimer(
          tdHours.toString().padStart(2, '0') +
            ':' +
            tdMinutes.toString().padStart(2, '0') +
            ':' +
            tdSeconds.toString().padStart(2, '0'),
        );
      }
    }
  };

  useEffect(() => {
    if (pauseSeconds === 60) {
      setPauseSeconds(0);
      setPauseMinutes(pauseMinutes => pauseMinutes + 1);
    }
    if (pauseMinutes === 60) {
      setPauseMinutes(0);
      setPauseHours(pauseHours => pauseHours + 1);
    }
  }, [pauseSeconds, pauseMinutes]);

  //**** End ****//

  /**
   * Removes a product from the invoiceData using index and updates Async storage object
   * @param {*} index
   */

  const removeProduct = index => {
    invoiceData.products.splice(index, 1);
    getInvoiceData();
    closeDeleteProductBottomSheet();
  };
  const removeServiceAgreement = index => {
    invoiceData.service_agreements.splice(index, 1);
    saveInvoiceData();
    closeDeleteServiceAgreementBottomSheet();
  };

  function deleteTimeSheet() {
    setTimeSheetView(false);
    setTimeSheet(null);
    var timeAmount = parseInt(productsTotal) - 83.52;
    newAmount = timeAmount.toFixed(2);
    if (newAmount == -0.52) {
      setProductsTotal(0.0);
    } else {
      setProductsTotal(newAmount);
    }

    deleteTimer.current.close();
  }

  const calculateTotalPay = text => {
    var subtractTotalAmount = parseFloat(productsTotal) - parseFloat(text);
    setBalance(subtractTotalAmount);
  };

  function editProductFunction(product) {
    setProductId(product.id);
    console.log(product.id);
    setProductCode(product.code);
    setDescription(product.description);
    setQty(product.quantity);
    setEmployeeHours(product.labour_hours);
    setAmount(product.actual_amount);
    setSelectEmployees(product.employees);
    setProductStatus(product.product_type);
    setEditString('edit_product');
    setDefaultForm(false);
    setCategory(false);
    setProduct(false);
    setEmployee(false);
    setAddEmployee(false);
    setServicesAgreement(false);
    setCustomProduct(true);
    setProductsModal(true);
    deleteProductsRBSheet.current.close();
  }
  function editProduct() {
    setEditString('edit_product');
    whenEdit();
    toggleProductsModal();
    setProductsModal(true);
    setDefaultForm(false);
    setCustomProduct(true);
    deleteProductsRBSheet.current.close();
  }

  const updateState = () => {
    removeProduct();
    setTimeout(() => {
      saveCustomProduct();
    }, 200);
  };

  /**
   * Bottom Sheet function and var
   */
  const clientListRBSheet = useRef(null);
  const selectTicketRBSheet = useRef(null);
  const deleteProductsRBSheet = useRef(null);
  const deleteServiceAgreementRBSheet = useRef(null);
  const deleteTimer = useRef(null);
  const selectPaymentTypeRBSheet = useRef(null);

  function openClientListBottomSheet() {
    clientListRBSheet.current.open();
  }
  function openDeleteProductBottomSheet(index, product) {
    // setEditProducts(product);
    setProductId(product.id);
    setProductCode(product.code);
    setDescription(product.description);
    setQty(product.quantity);
    setEmployeeHours(product.labour_hours);
    setAmount(product.actual_amount);
    setSelectEmployees(product.employees);
    setProductStatus(product.product_type);
    //console.log(product);
    deleteProductsRBSheet.current.open(index);
  }
  function closeDeleteProductBottomSheet(index) {
    deleteProductsRBSheet.current.close(index);
  }

  function openDeleteServiceAgreementBottomSheet(index, service_agreement) {
    //setServiceAgreementId(service_agreement.id);
    deleteServiceAgreementRBSheet.current.open(index);
  }
  function closeDeleteServiceAgreementBottomSheet(index) {
    deleteServiceAgreementRBSheet.current.close(index);
  }

  /**
   * signature Functions
   */

  const sign = createRef();

  const saveSign = () => {
    sign.current.saveImage();
  };

  const resetSign = () => {
    sign.current.resetImage();
  };

  const _onSaveEvent = result => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    setSignature(result.encoded);
    setSignaturePad(false);
    Alert.alert(
      STRING_CONSTANTS.default_alert_box_tittle,
      STRING_CONSTANTS.captured_signature_alert_box,
      [{text: 'OK', onPress: () => ''}],
    );
  };

  const _onDragEvent = () => {
    // This callback will be called when the user enters signature
    console.log('dragged');
  };

  /**
   * ActivityIndicator refresh on when user pull to bottom
   */

  const renderFooter = () => {
    return (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator animating size="large" color="#5dbf06" />
      </View>
    );
  };

  /**
   * handel load more data from fetch api
   */

  const handleLoadMore = () => {
    var pagination_page = currentPage; // initialize the variable with 0
    if (loadData == false) {
      if (moreDataLoading == false) {
        pagination_page += 1; // add 1 to the variable using the increment operator
        setCurrentPage(pagination_page);
        clientNameFetchData(pagination_page);
      }
    }
  };

  /**
   * Fetch Catalog From Api Data when user select
   */

  const FetchCatalogData = async () => {
    setCatalogData();
    setManufacturerName();
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(URL_CONFIG.Url + 'api/catalogs', options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          //console.log(data);
          setCatalogData(newData.catalogs.data);
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
   * Fetch Category  From Api Data  when user select
   */
  const FetchCategoryData = async item => {
    setCategoryData();
    setCatalogId(item.id);
    setManufacturerName(item.manufacturer_name);
    setCatalog(false);
    setCategory(true);
    var itemId = item.id;
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(URL_CONFIG.Url + 'api/catalog/categories?id=' + itemId, options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          setCategoryData(newData.categories.data);
          // console.log(newData.categories.data);
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
   * Fetch products data Api when user select
   */

  const fetchProductsData = async item => {
    setProductData();
    setManufacturerName(item.des);
    setCategory(false);
    setProduct(true);
    var itemId = item.id;
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(
      URL_CONFIG.Url +
        'api/catalog/product?catalog_id=' +
        catalogId +
        '&catalog_category_id=' +
        itemId,
      options,
    )
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          // console.log(newData.products);
          setProductData(newData.products);
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
   * Fetch WarrantyPercentage From Api when user select
   */

  const warrantyPercentage = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(URL_CONFIG.Url + 'api/metrics/settings', options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          // console.log(data)
          setWarranty(newData.warranty_reserve);
          setContingencyProduct(newData.contingency_product);
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
   * Add product and map products
   */
  function saveAddProduct(item) {
    var warranty_value = warranty;
    var amount_value = item.cost * 1;
    amount_value = amount_value + (amount_value * warranty_value) / 100;
    var numFix = amount_value;
    var totalNum = numFix.toFixed(2);
    var product = {
      id: item.id,
      code: item.product_no,
      name: item.name,
      product_type: 'product',
      description: `${item.des}`,
      labour_hours: 0,
      quantity: '1',
      employees: [],
      actual_amount: `${item.cost}`,
      total: totalNum,
    };
    invoiceTotal = parseInt(invoiceTotalAmount) + totalNum;
    setInvoiceTotalAmount(invoiceTotal);
    invoiceData.products.push(product);
    toggleProductsModal();
    getInvoiceData();
  }

  /**
   * FetchData Service Agreement Api
   */

  const fetchServiceAgreementData = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    fetch(URL_CONFIG.Url + 'api/service_agreement', options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          //console.log(data.service_agreements.data);
          setServiceAgreementData(newData.service_agreements.data);
          setRefreshing(false);
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
   * Fetch Employee data from api
   */
  const FetchEmployeeData = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    await fetch(URL_CONFIG.Url + 'api/employees', options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          // console.log(newData.employees.data);
          setEmployeeData(newData.employees.data);
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

  ////  API End ////

  /**
   * Add Service Agreement to async storage
   */

  function AddServiceAgreement(item) {
    var service_agreement = {
      serviceId: item.id,
      name: item.name,
      serviceQuantity: '1',
      serviceAmount: item.price,
    };
    invoiceTotal = parseInt(invoiceTotalAmount) + item.price;
    setInvoiceTotalAmount(invoiceTotal);
    invoiceData.service_agreements.push(service_agreement);
    setServicesAgreement(false);
    toggleProductsModal();
    getInvoiceData();
  }

  /**
   * Add Employee to save ver
   */

  async function saveSelectEmployee(item) {
    setEmployee(false);
    setAddEmployee(true);
    var employees = {
      employee_id: `${item.id}`,
      hours: '',
      name: item.fname + ' ' + item.lname,
      cost: item.hourly_wage,
    };
    const isIdExists = selectEmployees.some(
      item => item.employee_id === employees.employee_id,
    );
    if (!isIdExists) {
      selectEmployees.push(employees);
    } else {
      Alert.alert(
        STRING_CONSTANTS.default_alert_box_tittle,
        STRING_CONSTANTS.select_employee_alert_box,
        [{text: 'OK', onPress: () => ''}],
      );
    }
  }

  /**
   * handle input values change function
   */

  const handleChangeUpdateLabor = employee_id => text => {
    setSelectEmployees(prevItems =>
      prevItems.map(item =>
        item.employee_id === employee_id ? {...item, hours: text} : item,
      ),
    );
  };

  /**
   * save and add product to Employee Cost and Hours
   */

  async function saveAddEmployee() {
    // var filteredItems = employeeData.filter(item => item.hours > 0);
    //   setProductEmployees(filteredItems);
    setAddEmployee(false);
    setCustomProduct(true);
    const items = selectEmployees;
    var total_cost_labour = 0;
    var total_hours = 0;
    for (let i = 0; i < items.length; i++) {
      var hours = items[i].hours;
      var cost = items[i].cost;
      total_cost_labour = parseFloat(cost) * parseFloat(hours);
      total_hours += parseFloat(hours);
      setEmployeeHours(total_hours);
      setEmployeeCost(total_cost_labour);
    }
  }

  /**
   * create custom product in invoice
   */

  async function saveCustomProduct() {
    if (productCode == null) {
      setCPErrorMessage(STRING_CONSTANTS.product_code_required);
    } else if (description == null) {
      setCPErrorMessage(STRING_CONSTANTS.description_required);
    } else if (qty == null) {
      setCPErrorMessage(STRING_CONSTANTS.product_qty_required);
    } else if (employeeHours == null) {
      setCPErrorMessage(STRING_CONSTANTS.total_hour_required);
    } else if (amount == null) {
      setCPErrorMessage(STRING_CONSTANTS.amount_required);
    } else {
      var warranty_value = warranty;
      var contingency_product_value = employeeCost;
      var contingency_product_value =
        contingency_product_value + (employeeCost * contingencyProduct) / 100;
      var amount_value = parseInt(amount) * qty;
      amount_value = amount_value + (amount_value * warranty_value) / 100;
      totalAmount = amount_value + contingency_product_value;
      var numFix = totalAmount;
      var totalNum = numFix.toFixed(2);
      invoiceTotal = parseInt(invoiceTotalAmount) + numFix;
      setInvoiceTotalAmount(invoiceTotal);
      var product = {
        id: productId,
        code: productCode,
        product_type: productStatus,
        name: '',
        description: description,
        quantity: qty,
        labour_hours: employeeHours,
        employees: selectEmployees,
        actual_amount: amount,
        total: totalNum,
      };
      invoiceData.products.push(product);
      toggleProductsModal();
      getInvoiceData();
    }
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

  /**
   * return to error message function
   */

  function cPMessageReturn() {
    if (cPErrorMessage) {
      return <Text style={styles.ProductErrorMessage}> {cPErrorMessage} </Text>;
    }
  }

  /**
   * user view show date picker
   */

  function showDatePicker() {
    if (Platform.OS === 'ios') {
      return (
        <>
          {/* Date Picker */}
          <Text style={styles.Label}>
            {STRING_CONSTANTS.invoice_date_label}
          </Text>
          <View
            style={{
              alignSelf: 'center',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#B2B9BF',
              paddingVertical: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}>
            {show && (
              <RNDateTimePicker
                testID="dateTimePicker"
                value={invoiceDate}
                mode={mode}
                is24Hour={true}
                display={'default'}
                onChange={invoiceDateOnChange}
              />
            )}
            <View>
              <Image
                style={{
                  height: 35,
                  width: 35,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/calendar.png')}
              />
            </View>
          </View>

          {/* Date Picker End */}
        </>
      );
    } else {
      return (
        <>
          {/* Date Picker */}
          <Text style={styles.Label}>
            {STRING_CONSTANTS.invoice_date_label}
          </Text>
          <TouchableOpacity
            style={styles.DateMainContainer}
            onPress={() => showMode('date')}>
            <Text style={styles.Date}>{date}</Text>
            <TouchableOpacity onPress={() => showMode('date')}>
              <Image
                style={{
                  height: 35,
                  width: 35,
                  resizeMode: 'contain',
                  tintColor: 'black',
                }}
                source={require('./assets/calendar.png')}
              />
            </TouchableOpacity>
            {show && (
              <RNDateTimePicker
                testID="dateTimePicker"
                value={invoiceDate}
                mode={mode}
                is24Hour={true}
                display={'default'}
                onChange={invoiceDateOnChange}
              />
            )}
          </TouchableOpacity>
          {/* Date Picker End */}
        </>
      );
    }
  }

  /**
   * save invoice when user fill and convert to invoice user View
   */

  function valueSubmitInput() {
    if (windowWidth > 700) {
      return (
        <>
          <View style={styles.SubmitTabViewMainContainer}>
            <TextInput
              type="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder=""
              placeholderTextColor="#999999"
              value={note}
              onChangeText={note => setNote(note)}
              style={styles.NoteInputTabView}
            />
            <View
              style={{
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderWidth: 0.5,
                margin: 10,
                backgroundColor: '#FFFFFF',
                flex: 1,
                width: '60%',
                height: '100%',
                borderColor: '#cccccc',
              }}>
              <View style={styles.TextTabView}>
                <Text style={styles.TotalViewText}>Service Agreements</Text>

                <Text style={styles.TotalViewTextDetail}>$0.00</Text>
              </View>
              <View style={styles.TextTabView}>
                <Text style={styles.TotalViewText}>Total</Text>
                {productsTotal == 0 ? (
                  <>
                    <Text style={styles.TotalViewTextDetail}>$0.00</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.TotalViewTextDetail}>
                      ${productsTotal}
                    </Text>
                  </>
                )}
              </View>
              <TouchableOpacity onPress={() => ''} style={styles.TextTabView}>
                <Text style={styles.TotalViewText}>Paid</Text>

                {productsTotal > 0 ? (
                  <TextInput
                    keyboardType="numeric"
                    autoCorrect={false}
                    placeholder={STRING_CONSTANTS.total_pay}
                    placeholderTextColor="#c0c0c0"
                    value={totalPay}
                    onChangeText={text => {
                      calculateTotalPay(text);
                      setTotalPay(text);
                      setErrorMessage('');
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#B2B9BF',
                      marginVertical: 5,
                      paddingHorizontal: 15,
                      fontSize: 15,
                      fontFamily: 'DMSans-Medium',
                      color: '#000000',
                      width: 150,
                      height: 40,
                    }}
                  />
                ) : (
                  <>
                    <Text style={styles.TotalViewTextDetail}>$0.00</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => selectPaymentTypeRBSheet.current.open()}
                style={styles.TextTabView}>
                <Text numberOfLines={1} style={styles.TotalViewText}>
                  {STRING_CONSTANTS.payment_type_button_title}
                </Text>
                {paymentType ? (
                  <Text numberOfLines={1} style={styles.TotalViewTextDetail}>
                    {paymentType}
                  </Text>
                ) : (
                  <Text style={styles.TotalViewTextDetail}>Select</Text>
                )}
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.TotalViewBalanceDueText}>Balance Due</Text>
                {balance ? (
                  <>
                    <Text
                      numberOfLines={1}
                      style={styles.TotalViewBalanceDueTextDetail}>
                      ${balance}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.TotalViewBalanceDueTextDetail}>
                      $0.00
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setSignaturePad(true)}
            style={{
              padding: 5,
              backgroundColor: '#FFFFFF',
              width: '61%',
              alignSelf: 'flex-end',
              marginHorizontal: 20,
              marginVertical: 5,
              borderRadius: 5,
              flex: 1,
              borderWidth: 0.5,
              borderColor: '#cccccc',
            }}>
            <Text
              style={{
                color: '#000000',
                fontFamily: 'DMSans-Medium',
                fontSize: 17,
                textAlign: 'center',
              }}>
              Signature
            </Text>
          </TouchableOpacity>
          {signature ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 10,
                width: '61%',
                alignSelf: 'flex-end',
                marginHorizontal: 20,
                marginVertical: 5,
                flex: 1,
                backgroundColor: '#fff',
              }}>
              <Image
                style={{height: 100, width: 100, alignSelf: 'center'}}
                source={{uri: `data:image/png;base64,${signature}`}}
              />
            </View>
          ) : (
            <></>
          )}
          <View
            style={{
              width: '61%',
              alignSelf: 'flex-end',
              marginHorizontal: 20,
              flex: 1,
            }}>
            {returnErrorMessage()}
          </View>

          <TouchableOpacity
            onPress={() => convertToInvoice()}
            style={styles.ConvertToInvoiceButtonTabView}>
            <Text style={styles.ConvertToInvoiceTextTabView}>
              Convert to Invoice
            </Text>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <View style={{marginHorizontal: 20}}>
          <View style={styles.CreateProduct}>
            <Text style={styles.TotalAmountText}>
              {STRING_CONSTANTS.product_amount_sign}
              {productsTotal}
            </Text>
          </View>
          <TextInput
            keyboardType="numeric"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.total_pay}
            placeholderTextColor="#c0c0c0"
            value={totalPay}
            onChangeText={text => {
              calculateTotalPay(text);
              setTotalPay(text);
              setErrorMessage('');
            }}
            style={styles.TotalAmountInput}
          />
          <View style={styles.CreateProduct}>
            {balance ? (
              <Text style={styles.TotalAmountText}>
                {'$'}
                {balance}
              </Text>
            ) : (
              <Text style={styles.TotalAmountText}>
                {STRING_CONSTANTS.balance_due}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.SelectPaymentType}
            onPress={() => selectPaymentTypeRBSheet.current.open()}>
            {paymentType ? (
              <Text style={styles.PaymentTypeText}>{paymentType}</Text>
            ) : (
              <Text style={styles.PaymentTypeText}>
                {STRING_CONSTANTS.payment_type_button_title}
              </Text>
            )}
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
          {paymentType == STRING_CONSTANTS.payment_type_cheque && (
            <TextInput
              keyboardType="default"
              autoCorrect={false}
              placeholder={STRING_CONSTANTS.check_number}
              placeholderTextColor="#c0c0c0"
              value={checkNumber}
              onChangeText={checkNumber => setCheckNumber(checkNumber)}
              style={styles.TotalAmountInput}
            />
          )}
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.note}
            placeholderTextColor="#c0c0c0"
            value={note}
            onChangeText={note => setNote(note)}
            style={styles.NoteInput}
          />
          <TouchableOpacity
            style={styles.SelectPaymentType}
            onPress={() => SignatureRBSheet.current.open()}>
            <Text style={styles.PaymentTypeText}>Signature</Text>
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
          {signature ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 10,
              }}>
              <Image
                style={{height: 100, width: 100}}
                source={{uri: `data:image/png;base64,${signature}`}}
              />
            </View>
          ) : (
            <></>
          )}

          {returnErrorMessage()}
          <TouchableOpacity
            style={styles.ConvertToInvoiceButton}
            onPress={() => convertToInvoice()}>
            <Text style={styles.ConvertToText}>
              {STRING_CONSTANTS.invoice_save}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  /**
   * return error message when invoice un fill  and field is required (Component)
   */

  function returnErrorMessage() {
    if (errorMessage) {
      return (
        <>
          {windowWidth > 700 ? (
            <Text
              style={{
                marginVertical: 5,
                color: 'red',
                textAlign: 'center',
                fontFamily: 'DMSans-Medium',
                fontSize: 15,
              }}>
              {' '}
              {errorMessage}{' '}
            </Text>
          ) : (
            <Text style={styles.ErrorMessage}>{errorMessage} </Text>
          )}
        </>
      );
    }
  }

  /**
   * user Bottom tab bar view (Component)
   */

  function BottomTabBarView() {
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
              source={require('./assets/dashboard.png')}
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
          <TouchableOpacity
            style={styles.BottomTabBarButton}
            onPress={() =>
              navigation.navigate(NAVIGATION_STRING_CONSTANTS.ticket_screen)
            }>
            <Image
              style={styles.BottomTabBarImageIcon}
              source={require('./assets/invoice.png')}
            />
            <Text
              style={{
                color: '#5dbf06',
                fontFamily: 'DMSans-Bold',
                fontSize: 15,
              }}>
              Invoice
            </Text>
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
              style={styles.BottomTabBarImage}
              source={require('./assets/dashboard.png')}
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
  const [selectTimerLabel, setSelectTimerLabel] = useState(false);

  const handleOpenModal = () => {
    setSelectTimerLabel(true);
  };

  const handleCloseModal = () => {
    setSelectTimerLabel(false);
  };

  const handlePickerValueChange = itemValue => {
    setSelectedTimer(itemValue);
  };

  const [defaultForm, setDefaultForm] = useState(true);
  const [catalog, setCatalog] = useState(false);
  const [category, setCategory] = useState(false);
  const [product, setProduct] = useState(false);
  const [customProduct, setCustomProduct] = useState(false);
  const [employee, setEmployee] = useState(false);
  const [addEmployee, setAddEmployee] = useState(false);
  const [servicesAgreement, setServicesAgreement] = useState(false);
  const [signaturePad, setSignaturePad] = useState(false);

  /**
   * On create A new Product
   */

  function OnCreateProduct() {
    setQty();
    setDescription();
    setAmount();
    setProductCode();
    setEmployeeCost();
    setEmployeeHours();
    setSelectEmployees([]);
  }
  function OnOpenProductModel() {
    setEditString();
    setProductStatus('custom product');
    setDefaultForm(true);
    setCategory(false);
    setProduct(false);
    setCustomProduct(false);
    setEmployee(false);
    setAddEmployee(false);
    setServicesAgreement(false);
    toggleProductsModal();
    OnCreateProduct();
  }
  function whenEdit() {
    setDefaultForm(true);
    setCategory(false);
    setProduct(false);
    setCustomProduct(false);
    setEmployee(false);
    setAddEmployee(false);
    setServicesAgreement(false);
  }
  /**
   * popup default select Form (Component)
   */

  function defaultFormFunction() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity onPress={() => toggleProductsModal()}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: windowWidth > 700 ? 18 : 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Products
          </Text>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 110 : 100,
                borderRadius: 5,
              }}></Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{flex: 1}}>
          <View style={styles.MainContainerProductsData}>
            <TouchableOpacity
              style={styles.BoxContainer}
              onPress={() =>
                setDefaultForm(false) +
                setCustomProduct(true) +
                FetchCatalogData()
              }>
              <Text style={styles.CatalogNameText}>Custom Entry</Text>
              <Image
                style={styles.Icon}
                source={require('./assets/CollapsibleIcon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.BoxContainer}
              onPress={() => setDefaultForm(false) + setCatalog(true)}>
              <Text style={styles.CatalogNameText}>Add Product</Text>
              <Image
                style={styles.Icon}
                source={require('./assets/CollapsibleIcon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.BoxContainer}
              onPress={() =>
                setDefaultForm(false) + setServicesAgreement(true)
              }>
              <Text style={styles.CatalogNameText}>Services Agreement</Text>

              <Image
                style={styles.Icon}
                source={require('./assets/CollapsibleIcon.png')}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /**
   * popup select Catalog (Component)
   */

  function Catalog() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setCatalog(false) + setDefaultForm(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: windowWidth > 700 ? 18 : 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Catalogs
          </Text>
          <TouchableOpacity onPress={() => toggleProductsModal()}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        {ManufacturerName ? (
          <Text style={styles.ManufacturerName}>{ManufacturerName}</Text>
        ) : (
          <></>
        )}
        <View style={{flex: 1, marginTop: 10}}>
          {CatalogData ? (
            <FlatList
              data={CatalogData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <View style={styles.MainContainerProductsData}>
                  <TouchableOpacity
                    style={styles.BoxContainer}
                    onPress={() => FetchCategoryData(item)}>
                    <Text style={styles.CatalogNameText}>
                      {item.manufacturer_name}
                      {item.des}
                      {item.name}
                    </Text>

                    <Image
                      style={styles.Icon}
                      source={require('./assets/CollapsibleIcon.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )}
        </View>
      </View>
    );
  }

  /**
   * popup select Category (Component)
   */

  function Category() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setCategory(false) + setCatalog(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: windowWidth > 700 ? 18 : 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Select Category
          </Text>
          <TouchableOpacity onPress={() => toggleProductsModal()}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        {ManufacturerName ? (
          <Text style={styles.ManufacturerName}>{ManufacturerName}</Text>
        ) : (
          <></>
        )}

        <View style={{flex: 1, marginTop: 10}}>
          {categoryData ? (
            <FlatList
              data={categoryData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <View style={styles.MainContainerProductsData}>
                  <TouchableOpacity
                    style={styles.BoxContainer}
                    onPress={() => fetchProductsData(item)}>
                    <Text style={styles.CatalogNameText}>
                      {item.manufacturer_name}
                      {item.des}
                      {item.name}
                    </Text>

                    <Image
                      style={styles.Icon}
                      source={require('./assets/CollapsibleIcon.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )}
        </View>
      </View>
    );
  }

  /**
   * popup select Product (Component)
   */

  function Product() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setProduct(false) + setCategory(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: windowWidth > 700 ? 18 : 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Select Product
          </Text>
          <TouchableOpacity onPress={() => toggleProductsModal()}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        {ManufacturerName ? (
          <Text style={styles.ManufacturerName}>{ManufacturerName}</Text>
        ) : (
          <></>
        )}

        <View style={{flex: 1, marginTop: 10}}>
          {productData ? (
            <FlatList
              data={productData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <View style={styles.MainContainerProductsData}>
                  <TouchableOpacity
                    style={styles.BoxContainer}
                    onPress={() => saveAddProduct(item)}>
                    <Text style={styles.CatalogNameText}>
                      {item.manufacturer_name}
                      {item.des}
                      {item.name}
                    </Text>

                    <Image
                      style={styles.Icon}
                      source={require('./assets/add_box.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )}
        </View>
      </View>
    );
  }

  /**
   * popup select CustomProduct form (Component)
   */

  function CustomProduct() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          {editString ? (
            <TouchableOpacity onPress={() => toggleProductsModal()}>
              <Text
                style={{
                  fontSize: windowWidth > 700 ? 15 : 12,
                  paddingVertical: 5,
                  textAlign: 'center',
                  color: '#fff',
                  fontFamily: 'DMSans-Bold',
                  width: windowWidth > 700 ? 100 : 60,
                  backgroundColor: '#2c2c2c',
                  borderRadius: 5,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setCustomProduct(false) + setDefaultForm(true)}>
              <Text
                style={{
                  fontSize: windowWidth > 700 ? 15 : 12,
                  paddingVertical: 5,
                  textAlign: 'center',
                  color: '#fff',
                  fontFamily: 'DMSans-Bold',
                  width: windowWidth > 700 ? 100 : 60,
                  backgroundColor: '#2c2c2c',
                  borderRadius: 5,
                }}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <Text
            numberOfLines={1}
            style={{
              fontSize: windowWidth > 700 ? 18 : 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            {editString ? 'Edit Product' : 'Custom Products'}
          </Text>
          <View onPress={() => updateState()}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                textAlign: 'center',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
              }}></Text>
          </View>
        </View>
        <ScrollView style={{flex: 1}}>
          <View style={styles.customProductMainContainer}>
            <Text style={styles.InputLabels}>
              {STRING_CONSTANTS.product_code_label}
            </Text>
            <TextInput
              editable={productStatus == 'custom product' ? true : false}
              keyboardType="default"
              autoCorrect={false}
              placeholder="0"
              placeholderTextColor="#000000"
              value={productCode}
              onChangeText={ProductCode => {
                setProductCode(ProductCode);
                setCPErrorMessage('');
              }}
              style={styles.customProductInput}
            />
          </View>
          <View style={styles.customProductInputContainer}>
            <Text style={styles.InputLabels}>
              {STRING_CONSTANTS.description_label}
            </Text>
            <TextInput
              editable={productStatus == 'custom product' ? true : false}
              keyboardType="default"
              autoCorrect={false}
              placeholder={STRING_CONSTANTS.description_label}
              placeholderTextColor="#000000"
              value={description}
              onChangeText={description => {
                setDescription(description);
                setCPErrorMessage('');
              }}
              style={styles.customProductInput}
            />
          </View>
          <View style={styles.customProductInputContainer}>
            <Text style={styles.InputLabels}>
              {STRING_CONSTANTS.product_quantity}
            </Text>
            <TextInput
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#000000"
              value={qty}
              onChangeText={qty => {
                setQty(qty);
                setCPErrorMessage('');
              }}
              style={styles.customProductInput}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 30,
              paddingVertical: 8,
              borderBottomWidth: 0.5,
              borderColor: '#B2B9BF',
            }}>
            <Text style={styles.InputLabels}>
              {STRING_CONSTANTS.labor_label}
            </Text>
            <TouchableOpacity
              style={styles.customProductInput}
              onPress={() => toggleAddEmployeeModal()}>
              {employeeHours ? (
                <Text style={styles.InputLabels}>{employeeHours}</Text>
              ) : (
                <Text style={styles.InputLabels}>0</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.customProductInputContainer}>
            <Text style={styles.InputLabels}>
              {STRING_CONSTANTS.amount_label}
            </Text>
            <TextInput
              editable={productStatus == 'custom product' ? true : false}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#000000"
              value={amount}
              onChangeText={total => {
                setAmount(total);
                setCPErrorMessage('');
              }}
              style={styles.customProductInput}
            />
          </View>
          {cPMessageReturn()}
          <TouchableOpacity
            style={{
              width: '90%',
              backgroundColor: '#5DBF06',
              borderRadius: 5,
              margin: 10,
              alignSelf: 'center',
            }}
            onPress={() => (editString ? updateState() : saveCustomProduct())}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 17 : 15,
                paddingVertical: 15,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
              }}>
              Save
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /**
   * popup select and add Add Employee  (Component)
   */

  function addEmployeeFunction() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setAddEmployee(false) + setCustomProduct(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 18,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Add Employee
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View>
              <Text
                style={{
                  fontSize: windowWidth > 700 ? 15 : 12,
                  paddingVertical: 5,
                  textAlign: 'center',
                  width: windowWidth > 700 ? 100 : 60,
                }}></Text>
            </View>
          </View>
        </View>
        <View style={{flex: 1, marginTop: 10}}>
          <ScrollView>
            {selectEmployees ? (
              <>
                {selectEmployees.map((item, index) => (
                  <View key={item.employee_id}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 30,
                        paddingVertical: 10,
                        borderBottomWidth: 0.5,
                        borderColor: '#B2B9BF',
                      }}>
                      <Text
                        style={{
                          color: '#000000',
                          fontFamily: 'DMSans-Medium',
                          fontSize: 17,
                          textAlign: 'center',
                        }}>
                        {item.name}
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#000000"
                        value={item.hours}
                        onChangeText={handleChangeUpdateLabor(item.employee_id)}
                        style={{
                          color: 'black',
                          fontSize: 17,
                          fontFamily: 'DMSans-Medium',
                          alignSelf: 'center',
                          backgroundColor: '#FFFFFF',
                          paddingVertical: 15,
                          paddingHorizontal: 20,
                          width: '50%',
                          backgroundColor: '#f9fbee',
                          borderWidth: 0.5,
                          borderColor: '#B2B9BF',
                          borderRadius: 5,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <></>
            )}

            <TouchableOpacity
              onPress={() => setAddEmployee(false) + setEmployee(true)}>
              <Text
                style={{
                  fontSize: 15,
                  paddingVertical: 10,
                  textAlign: 'center',
                  color: 'black',
                  fontFamily: 'DMSans-Bold',
                  width: '80%',
                  backgroundColor: '#fff',
                  borderRadius: 5,
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: '#B2B9BF',
                  margin: 10,
                }}>
                Select Employee
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '80%',
                backgroundColor: '#5DBF06',
                borderRadius: 5,
                alignSelf: 'center',
                margin: 10,
              }}
              onPress={() => saveAddEmployee()}>
              <Text
                style={{
                  fontSize: windowWidth > 700 ? 17 : 15,
                  paddingVertical: 10,
                  textAlign: 'center',
                  color: '#fff',
                  fontFamily: 'DMSans-Bold',
                }}>
                Save
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  }

  /**
   * popup select Employee  (Component)
   */

  function selectEmployeeFunction() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setEmployee(false) + setAddEmployee(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 18,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Select Employee
          </Text>

          <Text
            style={{
              fontSize: windowWidth > 700 ? 15 : 12,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'DMSans-Bold',
              width: windowWidth > 700 ? 100 : 60,
              borderRadius: 5,
            }}></Text>
        </View>
        <View style={{flex: 1, marginTop: 10}}>
          {employeeData ? (
            <ScrollView>
              {employeeData.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={() => saveSelectEmployee(item)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingHorizontal: 30,
                      paddingVertical: 10,
                      borderBottomWidth: 0.5,
                      borderColor: '#B2B9BF',
                    }}>
                    <Text
                      style={{
                        color: '#000000',
                        fontFamily: 'DMSans-Medium',
                        fontSize: 17,
                        textAlign: 'center',
                      }}>
                      {item.fname} {item.lname}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )}
        </View>
      </View>
    );
  }

  /**
   * popup Draw signature  (Component)
   */

  function SignatureCaptureFunction() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}>
        <Text
          style={{
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
            fontFamily: 'DMSans-bold',
          }}>
          Invoice Signature !
        </Text>
        <SignatureCapture
          style={{
            flex: 1,
            borderColor: '#000033',
            borderWidth: 1,
          }}
          ref={sign}
          onSaveEvent={_onSaveEvent}
          onDragEvent={_onDragEvent}
          showNativeButtons={false}
          showTitleLabel={false}
          viewMode={'portrait'}
        />
        <View style={{flexDirection: 'row'}}>
          <TouchableHighlight
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              backgroundColor: '#000',
              margin: 10,
            }}
            onPress={() => {
              saveSign();
            }}>
            <Text style={{color: '#fff', fontFamily: 'DMSans-Medium'}}>
              Save
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              backgroundColor: '#000',
              margin: 10,
            }}
            onPress={() => {
              resetSign();
            }}>
            <Text style={{color: '#fff', fontFamily: 'DMSans-Medium'}}>
              Reset
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: 50,
              backgroundColor: '#000',
              margin: 10,
            }}
            onPress={() => {
              setSignaturePad(false);
            }}>
            <Text style={{color: '#fff', fontFamily: 'DMSans-Medium'}}>
              Cancel
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  /**
   * Convert to Invoice and save data database Post Api
   */

  async function convertToInvoice(locked) {
    if (locked) {
      var lockedValue = locked;
    } else {
      var lockedValue = null;
    }
    var userToken = await AsyncStorage.getItem('userToken');

    if (!invoiceData.client.id) {
      setErrorMessage(STRING_CONSTANTS.client_required);
    } else if (!ticketTypeId) {
      setErrorMessage(STRING_CONSTANTS.ticket_type_required);
    } else if (productsTotal == 0) {
      return null;
    } else if (!totalPay) {
      setErrorMessage(STRING_CONSTANTS.total_pay_required);
    } else if (!paymentType) {
      setErrorMessage(STRING_CONSTANTS.payment_type_required);
    } else {
      toggleLoading();
      fetch(URL_CONFIG.Url + 'api/invoices/save', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          ticket_type_id: ticketTypeId,
          status: ticketStatus,
          client_id: invoiceData.client.id,
          products: invoiceData.products,
          service_agreement: invoiceData.service_agreements,
          timesheetAmount: timeSheet,
          jobTime: jobTimer,
          travelTime: tdTimer,
          pauseTime: pauseTimer,
          total: productsTotal,
          paid: totalPay,
          payment_method: paymentType,
          balance: balance,
          cheque_no: checkNumber,
          ticketDate: date,
          ticket_locked: lockedValue,
          success: 'true',
        }),
      })
        .then(response => response.json())
        .then(async data => {
          toggleLoading();
          //console.log(data);
          if (data.success == true) {
            console.log(data);
            navigation.navigate(NAVIGATION_STRING_CONSTANTS.details_screen);
            Alert.alert(data.message);
          } else {
            console.log(data.message);
          }
        })
        .catch(error => {
          console.warn(error);
        });
    }
  }

  function ServicesAgreement() {
    return (
      <View style={styles.productModelContainer}>
        <View style={styles.PopUpHeader}>
          <TouchableOpacity
            onPress={() => setServicesAgreement(false) + setDefaultForm(true)}>
            <Text
              style={{
                fontSize: windowWidth > 700 ? 15 : 12,
                paddingVertical: 5,
                textAlign: 'center',
                color: '#fff',
                fontFamily: 'DMSans-Bold',
                width: windowWidth > 700 ? 100 : 60,
                backgroundColor: '#2c2c2c',
                borderRadius: 5,
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 18,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#000000',
              fontFamily: 'DMSans-Bold',
            }}>
            Service Agreement
          </Text>
          <Text
            style={{
              fontSize: 15,
              paddingVertical: 5,
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'DMSans-Bold',
              width: windowWidth > 700 ? 100 : 60,
            }}></Text>
        </View>

        <View style={{flex: 1, marginTop: 10}}>
          {serviceAgreementData ? (
            <FlatList
              data={serviceAgreementData}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <>
                  <TouchableOpacity
                    style={styles.ServiceAgreementDataContainer}
                    onPress={() => AddServiceAgreement(item)}>
                    <View style={styles.Data}>
                      <Text style={styles.ServiceAgreementProductNameText}>
                        {item.name}
                      </Text>
                      <Text style={styles.ServiceAgreementDesText}>
                        {item.des}
                      </Text>
                      <Text style={styles.ServiceAgreementPriceText}>
                        ${item.price}
                      </Text>
                    </View>
                    <Image
                      style={styles.ServiceAgreementAddIcon}
                      source={require('./assets/FloatingButton.png')}
                    />
                  </TouchableOpacity>
                </>
              )}
            />
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={updateInvoice} />
          }>
          {clientId ? (
            <View style={styles.DataView}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.ClientName}>
                  {invoiceData.client.fn} {invoiceData.client.ln}
                </Text>
                <TouchableOpacity onPress={() => openClientListBottomSheet()}>
                  <Image
                    style={{
                      width: 25,
                      height: 25,
                      resizeMode: 'contain',
                      tintColor: 'black',
                      marginRight: 30,
                    }}
                    source={require('./assets/EditProduct.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.EmailView}>
                <Image
                  style={styles.ImageIcon}
                  source={require('./assets/Email.png')}
                />
                <Text style={styles.ClientData}>
                  {invoiceData.client.email}
                </Text>
              </View>
              <View style={styles.EmailView}>
                <Image
                  style={styles.ImageIcon}
                  source={require('./assets/Call.png')}
                />
                <Text style={styles.ClientData}>
                  +{invoiceData.client.phone_no_1}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {windowWidth > 700 ? (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#333',
                    borderRadius: 5,
                    //borderWidth: 1,
                    // borderColor: '#cccccc',
                    marginVertical: 15,
                    marginHorizontal: 15,
                    paddingVertical: 5,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                  onPress={() => openClientListBottomSheet()}>
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: 'contain',
                      tintColor: '#fff',
                      paddingHorizontal: 30,
                    }}
                    source={require('./assets/FloatingButton.png')}
                  />
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'DMSans-Bold',
                      fontSize: 17,
                      textAlign: 'center',
                    }}>
                    {STRING_CONSTANTS.add_client}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.SelectClientView}
                  onPress={() => openClientListBottomSheet()}>
                  <Image
                    style={{
                      width: 35,
                      height: 35,
                      resizeMode: 'contain',
                      tintColor: 'black',
                      paddingHorizontal: 30,
                    }}
                    source={require('./assets/FloatingButton.png')}
                  />
                  <Text style={styles.AddProductText}>
                    {STRING_CONSTANTS.add_client}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={styles.TittleScreen}>
            {STRING_CONSTANTS.create_invoice_title}
          </Text>

          {TicketId ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginHorizontal: 15,
              }}>
              <TouchableOpacity
                onPress={() => ticketStatusChangeAlertBox((status = 'lock'))}
                style={{
                  backgroundColor: 'rgb(9, 120, 184)',
                  borderColor: '#cccccc',
                  borderWidth: 0.5,
                  borderRadius: 5,
                  justifyContent: 'center',
                  padding: 5,
                  marginHorizontal: 5,
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'DMSans-Bold',
                    fontSize: 12,
                    textAlign: 'center',
                    padding: 2,
                  }}>
                  Ticket Locked
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => ticketStatusChangeAlertBox((status = 'decline'))}
                style={{
                  backgroundColor: '#ff5d48',
                  borderColor: '#cccccc',
                  borderWidth: 0.5,
                  borderRadius: 5,
                  justifyContent: 'center',
                  padding: 5,
                  marginHorizontal: 5,
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'DMSans-Bold',
                    fontSize: 12,
                    textAlign: 'center',
                    padding: 2,
                  }}>
                  Ticket Decline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => ticketStatusChangeAlertBox((status = 'suspend'))}
                style={{
                  backgroundColor: '#1bb99a',
                  borderColor: '#cccccc',
                  borderWidth: 0.5,
                  borderRadius: 5,
                  justifyContent: 'center',
                  padding: 5,
                  marginHorizontal: 5,
                }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'DMSans-Bold',
                    fontSize: 12,
                    textAlign: 'center',
                    padding: 2,
                  }}>
                  Ticket Suspend
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}

          <View style={styles.timerMainContainer}>
            {Platform.OS === 'android' && (
              <View
                style={{
                  justifyContent: 'center',
                  alignSelf: 'stretch',
                  borderWidth: 1,
                  borderRadius: 5,
                  backgroundColor: '#fff',
                  width: windowWidth > 700 ? '47%' : '43%',
                  borderColor: '#B2B9BF',
                }}>
                <Picker
                  style={{
                    color: 'black',
                    borderColor: 'black',
                    borderWidth: 1,
                    height: 45,
                    width: windowWidth > 700 ? '100%' : '100%',
                  }}
                  itemStyle={{
                    backgroundColor: 'grey',
                    color: 'blue',
                    fontFamily: 'DMSans-Bold',
                    fontSize: 17,
                  }}
                  fontFamily="DMSans-Bold"
                  dropdownIconColor="black"
                  selectedValue={selectedTimer}
                  onValueChange={itemValue => setSelectedTimer(itemValue)}>
                  <Picker.Item
                    label="T&D Time"
                    value="T&D Time"
                    fontFamily="DMSans-Bold"
                  />
                  <Picker.Item
                    label="Job Time"
                    value="Job Time"
                    fontFamily="DMSans-Bold"
                  />
                  <Picker.Item
                    label="Pause Time"
                    value="Pause Time"
                    fontFamily="DMSans-Bold"
                  />
                </Picker>
              </View>
            )}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => handleOpenModal()}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: '#B2B9BF',
                  paddingVertical: 8,
                  alignSelf: 'stretch',
                  backgroundColor: '#fff',
                  width: windowWidth > 700 ? '47%' : '43%',
                  paddingHorizontal: 8,
                }}>
                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'DMSans-Bold',
                    fontSize: 15,
                    textAlign: 'center',
                  }}>
                  {selectedTimer}
                </Text>
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    resizeMode: 'contain',
                    tintColor: 'black',
                  }}
                  source={require('./assets/DropDown.png')}
                />
              </TouchableOpacity>
            )}

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {selectedTimer == 'T&D Time' && (
                <>
                  <Text style={styles.timerTextView}>
                    {tdHours.toString().padStart(2, '0')}:
                    {tdMinutes.toString().padStart(2, '0')}:
                    {tdSeconds.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity onPress={startTdTime}>
                    {isTdActive ? (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/pause.png')}
                      />
                    ) : (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/play.png')}
                      />
                    )}
                  </TouchableOpacity>
                </>
              )}
              {selectedTimer == 'Job Time' && (
                <>
                  <Text style={styles.timerTextView}>
                    {jobHours.toString().padStart(2, '0')}:
                    {jobMinutes.toString().padStart(2, '0')}:
                    {jobSeconds.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity onPress={startJobTime}>
                    {isJobActive ? (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/pause.png')}
                      />
                    ) : (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/play.png')}
                      />
                    )}
                  </TouchableOpacity>
                </>
              )}
              {selectedTimer == 'Pause Time' && (
                <>
                  <Text style={styles.timerTextView}>
                    {pauseHours.toString().padStart(2, '0')}:
                    {pauseMinutes.toString().padStart(2, '0')}:
                    {pauseSeconds.toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity onPress={startPauseTime}>
                    {isPauseActive ? (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/pause.png')}
                      />
                    ) : (
                      <Image
                        style={styles.timerImage}
                        source={require('./assets/play.png')}
                      />
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={styles.MainContainer}>
              <Text style={styles.Label}>
                {STRING_CONSTANTS.ticket_type_text}
              </Text>
              <TouchableOpacity
                style={styles.CreateTicketView}
                onPress={() => selectTicketRBSheet.current.open()}>
                {ticketDepreciation ? (
                  <Text numberOfLines={1} style={styles.CreateTicketText}>
                    {ticketDepreciation}
                  </Text>
                ) : (
                  <Text style={styles.CreateTicketText}>
                    {STRING_CONSTANTS.select_ticket_button_title}
                  </Text>
                )}
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    resizeMode: 'contain',
                    tintColor: 'black',
                  }}
                  source={require('./assets/DropDown.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.MainContainer}>{showDatePicker()}</View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginHorizontal: 20,
            }}>
            <Text style={styles.TittleProduct}>
              {STRING_CONSTANTS.products_title}
            </Text>
            {windowWidth < 700 && (
              <TouchableOpacity
                onPress={() => OnOpenProductModel()}
                style={{
                  borderWidth: 1,
                  borderColor: '#B2B9BF',
                  backgroundColor: '#fff',
                  borderRadius: 5,
                }}>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: 'contain',
                    tintColor: '#5dbf06',
                  }}
                  source={require('./assets/add_box.png')}
                />
              </TouchableOpacity>
            )}
          </View>

          {windowWidth > 700 ? (
            <View
              style={{
                marginHorizontal: 5,
              }}>
              <DataTable.Header>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Product Code
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Description
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Quantity
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Labor
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Amount
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Edit
                </DataTable.Title>
                <DataTable.Title textStyle={styles.ProductHeaderTittle} numeric>
                  Delete
                </DataTable.Title>
              </DataTable.Header>
            </View>
          ) : (
            <></>
          )}
          <View
            style={{
              flex: 1,
              marginHorizontal: windowWidth > 700 ? 5 : 20,
              marginVertical: 5,
            }}>
            {invoiceData.products.map((product, index) => (
              <View key={index}>
                {windowWidth > 700 ? (
                  <View style={{paddingTop: 10}}>
                    <DataTable.Header>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {product.code}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {product.description}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {product.quantity}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {product.labour_hours}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {product.total}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        <TouchableOpacity
                          onPress={() => editProductFunction(product)}
                          style={{
                            alignContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              resizeMode: 'contain',
                              tintColor: 'green',
                            }}
                            source={require('./assets/EditProduct.png')}
                          />
                        </TouchableOpacity>
                      </DataTable.Title>
                      <DataTable.Title numeric>
                        <TouchableOpacity
                          onPress={() => removeProduct(product, index)}
                          style={{
                            alignContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              resizeMode: 'contain',
                            }}
                            source={require('./assets/Delete.png')}
                          />
                        </TouchableOpacity>
                      </DataTable.Title>
                    </DataTable.Header>
                  </View>
                ) : (
                  <>
                    <View style={styles.ViewBox}>
                      <View style={styles.BoxHeader}>
                        <Text numberOfLines={1} style={styles.HeaderText}>
                          {product.code}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openDeleteProductBottomSheet(index, product)
                          }>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              resizeMode: 'contain',
                              tintColor: 'black',
                            }}
                            source={require('./assets/Button.png')}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.BoxText} numberOfLines={1}>
                        {STRING_CONSTANTS.description_label}:{' '}
                        {product.description}
                      </Text>
                      <Text style={styles.BoxText}>
                        {STRING_CONSTANTS.product_quantity}:{product.quantity}
                      </Text>
                      <Text style={styles.BoxText}>
                        {STRING_CONSTANTS.product_labor_time}
                        {product.labour_hours}
                      </Text>
                      <Text style={styles.AmountText}>
                        {STRING_CONSTANTS.product_amount_sign}
                        {product.total}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ))}
            {invoiceData.service_agreements.map((service_agreement, index) => (
              <View key={index}>
                {windowWidth > 700 ? (
                  <View style={{paddingTop: 10}}>
                    <DataTable.Header>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {service_agreement.name}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {service_agreement.description}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {service_agreement.serviceQuantity}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        0
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        {service_agreement.serviceAmount}
                      </DataTable.Title>
                      <DataTable.Title
                        textStyle={styles.DetailProductText}
                        numeric>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              STRING_CONSTANTS.default_alert_box_tittle,
                              STRING_CONSTANTS.edit_service_agreement_alert_box,
                              [{text: 'OK', onPress: () => ''}],
                            )
                          }
                          style={{
                            alignContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              resizeMode: 'contain',
                              tintColor: 'green',
                            }}
                            source={require('./assets/EditProduct.png')}
                          />
                        </TouchableOpacity>
                      </DataTable.Title>
                      <DataTable.Title numeric>
                        <TouchableOpacity
                          onPress={() =>
                            removeServiceAgreement(service_agreement, index)
                          }
                          style={{
                            alignContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              resizeMode: 'contain',
                            }}
                            source={require('./assets/Delete.png')}
                          />
                        </TouchableOpacity>
                      </DataTable.Title>
                    </DataTable.Header>
                  </View>
                ) : (
                  <View style={styles.ViewBox}>
                    <View style={styles.BoxHeader}>
                      <Text style={styles.HeaderText}>
                        {service_agreement.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          openDeleteServiceAgreementBottomSheet(
                            index,
                            service_agreement,
                          )
                        }>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            resizeMode: 'contain',
                            tintColor: 'black',
                          }}
                          source={require('./assets/Button.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.BoxText} numberOfLines={1}>
                      {STRING_CONSTANTS.description_label}:
                      {service_agreement.description}
                    </Text>
                    <Text style={styles.BoxText}>
                      {STRING_CONSTANTS.product_quantity}:{' '}
                      {service_agreement.serviceQuantity}
                    </Text>
                    <Text style={styles.BoxText}>
                      {STRING_CONSTANTS.product_labor_time}
                      {/*product.labour*/}
                      {/*total labor time*/}
                    </Text>
                    <Text style={styles.AmountText}>
                      {STRING_CONSTANTS.product_amount_sign}
                      {service_agreement.serviceAmount}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {timeSheetView == true && (
              <View>
                {windowWidth > 700 ? (
                  <>
                    <View
                      style={{paddingTop: 10}}
                      onPress={() => deleteTimer.current.open()}>
                      <DataTable.Header>
                        <DataTable.Title textStyle={styles.DetailProductText}>
                          {STRING_CONSTANTS.td_time_title}
                        </DataTable.Title>
                        <DataTable.Title textStyle={styles.DetailProductText}>
                          -
                        </DataTable.Title>
                        <DataTable.Title
                          textStyle={styles.DetailProductText}
                          numeric>
                          1
                        </DataTable.Title>
                        <DataTable.Title
                          textStyle={styles.DetailProductText}
                          numeric>
                          0
                        </DataTable.Title>
                        <DataTable.Title
                          textStyle={styles.DetailProductText}
                          numeric>
                          83.52
                        </DataTable.Title>
                        <DataTable.Title
                          textStyle={styles.DetailProductText}
                          numeric>
                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert(
                                STRING_CONSTANTS.default_alert_box_tittle,
                                STRING_CONSTANTS.edit_timer_alert_box,
                                [{text: 'OK', onPress: () => ''}],
                              )
                            }
                            style={{
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={{
                                width: 30,
                                height: 30,
                                resizeMode: 'contain',
                                tintColor: 'green',
                              }}
                              source={require('./assets/EditProduct.png')}
                            />
                          </TouchableOpacity>
                        </DataTable.Title>
                        <DataTable.Title numeric>
                          <TouchableOpacity
                            onPress={() => deleteTimeSheet()}
                            style={{
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={{
                                width: 30,
                                height: 30,
                                resizeMode: 'contain',
                              }}
                              source={require('./assets/Delete.png')}
                            />
                          </TouchableOpacity>
                        </DataTable.Title>
                      </DataTable.Header>
                    </View>
                  </>
                ) : (
                  <View style={styles.ViewBox}>
                    <View style={styles.BoxHeader}>
                      <Text style={styles.HeaderText}>
                        {STRING_CONSTANTS.td_time_title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteTimer.current.open()}>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            resizeMode: 'contain',
                            tintColor: 'black',
                          }}
                          source={require('./assets/Button.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.BoxText}>
                      {STRING_CONSTANTS.product_quantity}: 1
                    </Text>
                    <Text style={styles.BoxText}>
                      {STRING_CONSTANTS.product_labor_time} 0
                    </Text>
                    <Text style={styles.AmountText}>
                      {STRING_CONSTANTS.product_amount_sign}83.52
                    </Text>
                  </View>
                )}
              </View>
            )}
            {windowWidth > 700 ? (
              <TouchableOpacity
                onPress={() => OnOpenProductModel()}
                style={{
                  marginHorizontal: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-end',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.29,
                  shadowRadius: 4.65,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: '#B2B9BF',
                  backgroundColor: '#fff',
                  borderRadius: 3,
                  padding: 1,
                  margin: 5,
                }}>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    resizeMode: 'contain',
                    tintColor: '#5dbf06',
                  }}
                  source={require('./assets/add_box.png')}
                />
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
          {valueSubmitInput()}

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
              <Text style={styles.TittleClientList}>
                {STRING_CONSTANTS.select_client_bottom_sheet_title}
              </Text>
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
                data={clientListData}
                keyExtractor={(item, index) => index}
                renderItem={({item}) => (
                  <>
                    <TouchableOpacity
                      style={styles.DataViewBox}
                      onPress={() => {
                        setInvoiceClient(item);
                        clientListRBSheet.current.close();
                      }}>
                      <View style={styles.ImageView}>
                        <View style={styles.DataViewClientList}>
                          <Text style={styles.dataViewTextName}>
                            {item.fname} {item.lname}
                          </Text>
                          <Text style={styles.DataViewText}>
                            +{item.phone_no_1}
                          </Text>
                          <Text style={styles.DataViewText}>{item.email}</Text>
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
            ref={selectTicketRBSheet}
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
            <View style={styles.RBTicketsView}>
              {/* <Text style={styles.TittleBottomSheet}>Select Ticket Type</Text> */}
              <FlatList
                data={ticketTypeData}
                keyExtractor={(item, index) => index}
                renderItem={({item}) => (
                  <>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                      <TouchableOpacity
                        style={styles.PaymentTypeBottom}
                        onPress={() => selectTicket(item)}>
                        <Text style={styles.PaymentTypeBottomText}>
                          {item.des}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              />
            </View>
          </RBSheet>
          <RBSheet
            ref={deleteProductsRBSheet}
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
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => removeProduct()}>
                <Text style={styles.DeleteText}>Delete</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/Delete.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => editProduct()}
                style={styles.DeleteTypeBottom}>
                <Text style={styles.EditText}>Edit</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          </RBSheet>
          <RBSheet
            ref={deleteServiceAgreementRBSheet}
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
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => removeServiceAgreement()}>
                <Text style={styles.DeleteText}>Delete</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/Delete.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(
                    STRING_CONSTANTS.default_alert_box_tittle,
                    STRING_CONSTANTS.edit_service_agreement_alert_box,
                    [{text: 'OK', onPress: () => ''}],
                  )
                }>
                <Text style={styles.EditText}>Edit</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          </RBSheet>
          <RBSheet
            ref={deleteTimer}
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
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() => deleteTimeSheet()}>
                <Text style={styles.DeleteText}>Delete</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/Delete.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.DeleteTypeBottom}
                onPress={() =>
                  Alert.alert(
                    STRING_CONSTANTS.default_alert_box_tittle,
                    STRING_CONSTANTS.edit_timer_alert_box,
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                  )
                }>
                <Text style={styles.EditText}>Edit</Text>
                <Image
                  style={{resizeMode: 'contain', height: 25, width: 25}}
                  source={require('./assets/EditProduct.png')}
                />
              </TouchableOpacity>
            </View>
          </RBSheet>
          <RBSheet
            ref={selectPaymentTypeRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            height={300}
            customStyles={{
              wrapper: {
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              },
              draggableIcon: {
                backgroundColor: '#000',
              },
            }}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <TouchableOpacity
                style={styles.PaymentTypeBottom}
                onPress={() =>
                  setPaymentType('Cash') +
                  selectPaymentTypeRBSheet.current.close()
                }>
                <Text style={styles.PaymentTypeBottomText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.PaymentTypeBottom}
                onPress={() =>
                  setPaymentType('Cheque') +
                  selectPaymentTypeRBSheet.current.close()
                }>
                <Text style={styles.PaymentTypeBottomText}>Cheque</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.PaymentTypeBottom}
                onPress={() =>
                  setPaymentType('Credit Card') +
                  selectPaymentTypeRBSheet.current.close()
                }>
                <Text style={styles.PaymentTypeBottomText}>Credit Card</Text>
              </TouchableOpacity>
            </View>
          </RBSheet>
        </ScrollView>

        {/* products Modal popup */}

        <View style={{flex: 1}}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={productsModal}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex: 1}}>
              <View style={styles.ModelMainContainer}>
                {defaultForm == true && <>{defaultFormFunction()}</>}
                {catalog == true && <>{Catalog()}</>}
                {category == true && <>{Category()}</>}
                {product == true && <>{Product()}</>}
                {customProduct == true && <>{CustomProduct()}</>}
                {addEmployee == true && <>{addEmployeeFunction()}</>}
                {employee == true && <>{selectEmployeeFunction()}</>}
                {servicesAgreement == true && <>{ServicesAgreement()}</>}
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>

        <Modal
          visible={signaturePad}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSignaturePad(false)}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              flex: 1,
              justifyContent: 'center',
            }}>
            {SignatureCaptureFunction()}
          </View>
        </Modal>
        <Modal
          visible={selectTimerLabel}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectTimerLabel(false)}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              flex: 1,
              justifyContent: 'center',
            }}>
            <View
              style={{
                margin: 30,
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#B2B9BF',
              }}>
              <Picker
                selectedValue={selectedTimer}
                onValueChange={handlePickerValueChange}>
                <Picker.Item label="T&D Time" value="T&D Time" />
                <Picker.Item label="Job Time" value="Job Time" />
                <Picker.Item label="Pause Time" value="Pause Time" />
              </Picker>
              <Button title="Close" onPress={handleCloseModal} />
            </View>
          </View>
        </Modal>

        <View style={{flex: 1}}>
          <Modal animationType="fade" transparent={true} visible={loading}>
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
        {BottomTabBarView()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MobileInvoice;

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  ProductMainContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  CreateTicketView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: '100%',
  },
  CreateTicketText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
  SelectClientView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 20,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  DataView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingVertical: 15,
  },
  ClientName: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 25,
    padding: 8,
    paddingLeft: 30,
  },
  ClientData: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    padding: 8,
  },
  ImageIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  EmailView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
  },
  TittleScreen: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 10,
  },
  TittleClientList: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    paddingHorizontal: 22,
  },
  DateMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    paddingVertical: 5,
    paddingLeft: 10,
  },
  Label: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    paddingVertical: 5,
  },
  Date: {
    color: '#333333',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
  },
  TimerMainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 0.7,
    borderColor: '#cccccc',
    paddingTop: 10,
    marginVertical: 2,
    marginHorizontal: 2,
  },
  TimerTittleText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    textAlign: 'center',
    borderBottomWidth: 0.7,
    borderColor: '#cccccc',
    paddingBottom: 5,
  },

  timerText: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  timerButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  timerButton: {
    backgroundColor: '#333',
    borderRadius: 5,
    paddingVertical: 6,
    margin: 10,
    width: '30%',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  TittleProduct: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    paddingVertical: 10,
  },
  ViewBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 5,
  },
  BoxHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  HeaderText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 20,
  },
  BoxText: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
    marginTop: 5,
    marginLeft: 10,
  },
  AmountText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    marginTop: 10,
    alignSelf: 'flex-end',
    margin: 10,
  },
  ViewBoxAddProduct: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 5,
    paddingVertical: 10,
  },
  DeleteText: {
    color: '#FC0005',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
  EditText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },
  CreateProduct: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    marginVertical: 5,
    padding: 12,
  },
  TotalAmountText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    paddingHorizontal: 10,
    padding: 3,
  },
  TotalAmountInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    marginVertical: 5,
    paddingHorizontal: 20,
    padding: 10,
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: '#000000',
  },
  NoteInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    marginVertical: 12,
    paddingHorizontal: 20,
    padding: 10,
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: '#000000',
  },
  SelectPaymentType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    marginTop: 5,
  },
  PaymentTypeText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  PaymentTypeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 25,
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
  PaymentTypeBottomText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  DeleteTypeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  ConvertToInvoiceButton: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#333',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 5,
    padding: 15,
  },
  AddProductText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  ConvertToText: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontSize: 18,
  },

  // Bottom Sheet Styling
  MainContainerClientList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  SearchBar: {
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAEAEA',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#444444',
    padding: 10,
    marginVertical: 15,
    marginHorizontal: 20,
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
  DataViewText: {
    color: '#808080',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    margin: 2,
  },

  ///** Select Tickets Type Bottom Sheet */
  RBTicketsView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  RBTicketMainContainer: {
    flex: 1,
  },
  RBTicketButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
    padding: 20,
    borderColor: '#B2B9BF',
    borderBottomWidth: 1,
  },
  RBButtonText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginLeft: 15,
    marginTop: 5,
  },
  RBIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'black',
  },

  DataViewBox: {
    margin: 5,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    borderColor: '#B2B9BF',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  DataViewClientList: {
    flexDirection: 'column',
  },
  ImageView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataViewTextName: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    margin: 2,
  },
  ErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  marginTop: 10,
  color: 'red',
  textAlign: 'center',
  fontFamily: 'DMSans-Regular',
  fontSize: 15,
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
  SignatureContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  SignatureTitleStyle: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    textAlign: 'left',
    marginHorizontal: 10,
    marginVertical: 20,
  },
  Signature: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0.5,
    color: 'black',
  },
  SignatureButtonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#495057',
    margin: 10,
  },
  SignatureButtonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
  },

  // Tab View Styling

  SubmitTabViewMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  NoteInputTabView: {
    color: 'black',
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#cccccc',
    margin: 20,
    backgroundColor: '#FFFFFF',
    width: '30%',
    height: '100%',
  },
  TextTabView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#cccccc',
  },
  TotalViewText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 5,
  },
  TotalViewTextDetail: {
    color: 'black',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  TotalViewBalanceDueText: {
    color: 'red',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 5,
  },
  TotalViewBalanceDueTextDetail: {
    color: 'red',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  ConvertToInvoiceButtonTabView: {
    backgroundColor: '#5dbf06',
    padding: 8,
    width: '61%',
    alignSelf: 'flex-end',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 5,
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#cccccc',
  },
  ConvertToInvoiceTextTabView: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  DataViewTab: {
    flex: 1,
    // backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    //  borderWidth: 1,
    //  borderColor: '#cccccc',
    paddingVertical: 15,
  },
  ClientNameTabView: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 25,
    padding: 8,
    paddingLeft: 30,
  },
  ClientDataTabView: {
    color: '#fff',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    padding: 8,
  },
  ImageIconTabView: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  ProductHeaderTittle: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    fontWeight: 'bold',
  },
  DetailProductText: {
    color: 'black',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
  },

  ///new Timers stylings
  timerMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timerImage: {
    height: 35,
    width: 35,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  timerTextView: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'DMSans-Bold',
    marginHorizontal: 10,
  },
  //new popup
  MainContainerProductsData: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  CatalogNameText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginLeft: 15,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  BoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
    padding: 20,
    borderColor: '#B2B9BF',
    borderBottomWidth: 1,
  },
  Icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  productModelContainer: {
    backgroundColor: 'white',
    height: '70%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#B2B9BF',
  },
  PopUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
    backgroundColor: '#d9d9d9',
  },
  PopUpCancelButton: {
    fontSize: 15,
    paddingVertical: 5,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    width: 100,
    backgroundColor: '#2c2c2c',
    borderRadius: 5,
  },
  PopUpTittle: {
    fontSize: 18,
    paddingVertical: 5,
    textAlign: 'center',
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    width: 100,
  },
  ManufacturerName: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'DMSans-Bold',
    textTransform: 'capitalize',
    marginVertical: 5,
  },
  // ServiceAgreement modal styling
  ServiceAgreementDataContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#B2B9BF',
  },
  ServiceAgreementAddIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#fff',
    paddingHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  ServiceAgreementProductNameText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 2,
  },
  ServiceAgreementDesText: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 2,
  },
  ServiceAgreementPriceText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 2,
  },
  ProductErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  ModelMainContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customProductMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#B2B9BF',
  },
  customProductInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#B2B9BF',
  },
  InputLabels: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
  },
  customProductInput: {
    color: 'black',
    fontSize: 17,
    fontFamily: 'DMSans-Medium',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '50%',
    backgroundColor: '#f9fbee',
    borderWidth: 0.5,
    borderColor: '#B2B9BF',
    borderRadius: 5,
  },
});
