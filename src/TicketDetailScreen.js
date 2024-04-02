import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  BackHandler,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import URL_CONFIG from './Components/global-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './Components/BottomTabBar';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import STRING_CONSTANTS from './strings/strings';
import RNFetchBlob from 'rn-fetch-blob';
import {Dimensions} from 'react-native';
// import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
// import {faFilePdf} from '@fortawesome/free-regular-svg-icons';
import NAVIGATION_STRING_CONSTANTS from './navigation/NavigarionStringConstants';

const DownloadScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    ClientId,
    ClientFName,
    ClientLName,
    ClientEmail,
    ClientMobile,
    TicketId,
  } = route.params ?? {};

  //// Variable initialization  ////

  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [serviceAgreements, setServiceAgreements] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [timeSheet, setTimeSheet] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [signature, setSignature] = useState();

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [orientation, setOrientation] = useState('portrait');

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    fetchTicketDetail();
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
      fetchTicketDetail();
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
   * Fetch Data Invoice Details Api
   */

  const fetchTicketDetail = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    var options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    };
    fetch(URL_CONFIG.Url + 'api/invoices?ticket_id=' + TicketId, options)
      .then(response => response.json())
      .then(responseJson => {
        const newData = responseJson;
        if (newData.success == true) {
          setTimeSheet(newData.timesheets);
          setTickets(newData.tickets);
          setCustomProducts(newData.custom_products);
          setProducts(newData.products);
          setServiceAgreements(newData.service_agreements);
         //console.log(newData.service_agreements);
          setInvoices(newData.invoices);
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
   * Alert to permission and download pdf
   */
  const downloadPdfAlert = () =>
    Alert.alert(
      STRING_CONSTANTS.default_alert_box_tittle,
      STRING_CONSTANTS.download_invoice_alert_box,
      [
        {
          text: 'NO',
          onPress: () => '',
          style: 'no',
        },
        {text: 'YES', onPress: () => downloadFileNew()},
      ],
    );

  async function downloadFileNew() {
    const token = await AsyncStorage.getItem('userToken');
    fileName = 'invoice.pdf';
    description = '';
    const {config, android, ios, fs} = RNFetchBlob;
    const mimeType = 'application/pdf';
    const downloadDir =
      Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
    const options = {
      fileCache: true,
      addAndroidDownloads: {
        //Related to the Android only
        useDownloadManager: true,
        mediaScannable: true,
        notification: true,
        path: `${downloadDir}/invoice.pdf`,
        description,
        mimeType,
      },
      ios: {
        //Related to the IOS only
        path: `${downloadDir}/invoice.pdf`,
        description,
        mimeType,
      },
      appendExt: 'pdf',
    };

    await config(options)
      .fetch('GET', URL_CONFIG.Url + 'api/tickets/print?id=' + TicketId, {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        accept: 'application/json',
      })
      .then(res => {
        // to open file after download
        if (Platform.OS === 'ios') {
          ios.openDocument(res.data);
        } else {
          android.actionViewIntent(res.path(), mimeType);
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={{backgroundColor: '#F5F5F5'}}>
        <View style={styles.DataView}>
          <Text style={styles.ClientName}>
            {ClientFName} {ClientLName}
          </Text>
          <View style={styles.EmailView}>
            <Image
              style={styles.ImageIcon}
              source={require('./assets/Email.png')}
            />
            <Text style={styles.ClientData}>{ClientEmail}</Text>
          </View>
          <View style={styles.EmailView}>
            <Image
              style={styles.ImageIcon}
              source={require('./assets/Call.png')}
            />
            <Text style={styles.ClientData}>+{ClientMobile}</Text>
          </View>
        </View>
        <Text style={styles.TittleScreen}>Ticket Details</Text>

        {invoices ? (
          invoices.length > 0 ? (
            <>
              {invoices.map((item, index) => (
                <View key={index} style={styles.invoicesDateView}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginVertical: 10,
                      marginHorizontal: 10,
                    }}>
                    <Text
                      style={{
                        color: '#000000',
                        fontFamily: 'DMSans-Bold',
                        fontSize: 16,
                        padding: 2,
                      }}>
                      Date:
                    </Text>
                    <Text
                      style={{
                        textDecorationLine: 'underline',
                        color: '#000000',
                        fontFamily: 'DMSans-Bold',
                        fontSize: 16,
                        padding: 2,
                      }}>
                      {item.date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.PdfDownloadButton}
                    onPress={() => downloadPdfAlert()}>
                    {/* <FontAwesomeIcon icon={faFilePdf} size={20} color="#fff" /> */}
                    <Text style={styles.PdfDownloadButtonText}>
                      {STRING_CONSTANTS.download_pdf_text}
                    </Text>
                    <Image source={require('./assets/download.png')} style={{height:17,width:17,tintColor:'#fff'}}/>
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.Tittle}>
                {windowWidth < 700 ? 'Products' : ''}
              </Text>
              <View style={styles.container}>
                {windowWidth > 700 ? (
                  <View style={styles.headerRow}>
                    <Text style={[styles.headerCell, {flex: 1}]}>Qty</Text>
                    <Text style={[styles.headerCell, {flex: 2}]}>
                      Product Code
                    </Text>
                    <Text style={[styles.headerCell, {flex: 2}]}>
                      Description
                    </Text>
                    <Text style={[styles.headerCell, {flex: 1}]}>Level</Text>
                    <Text style={[styles.headerCell, {flex: 1}]}>Amount</Text>
                  </View>
                ) : (
                  <></>
                )}
                {products.map((item, index) => (
                  <View key={index}>
                    {windowWidth > 700 ? (
                      <View style={styles.bodyRow}>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.quantity}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {item.product_no}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {item.product_description
                            ? item.product_description
                            : 'Product'}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.labour}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.total}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.productsView}>
                          <Text
                            numberOfLines={1}
                            style={styles.productCodeText}>
                            {item.product_no}
                          </Text>
                          <Text numberOfLines={1} style={styles.productText}>
                            {STRING_CONSTANTS.description_label}:{' '}
                            {item.description_label}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.product_quantity}: {item.quantity}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.labor_label}: {item.labour}
                          </Text>
                          <Text style={styles.productAmountText}>
                            {STRING_CONSTANTS.product_amount_sign}
                            {item.amount}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                ))}
                {serviceAgreements.map((item, index) => (
                  <View key={index}>
                    {windowWidth > 700 ? (
                      <View style={styles.bodyRow}>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.quantity}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {item.service_id}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          Service Agreement
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>-</Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.amount}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.productsView}>
                          <Text style={styles.productCodeText}>
                            {item.service_id}
                          </Text>
                          <Text numberOfLines={1} style={styles.productText}>
                            {STRING_CONSTANTS.description_label}:{' '}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.product_quantity}: {item.quantity}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.labor_label}: {item.labour}
                          </Text>
                          <Text style={styles.productAmountText}>
                            ${item.amount}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                ))}
                {customProducts.map((item, index) => (
                  <View key={index}>
                    {windowWidth > 700 ? (
                      <View style={styles.bodyRow}>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.quantity}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {item.product_code}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {item.product_name
                            ? item.product_name
                            : 'Custom Product'}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.labour}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.total}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.productsView}>
                          <Text
                            numberOfLines={1}
                            style={styles.productCodeText}>
                            {item.product_code}
                          </Text>
                          <Text numberOfLines={1} style={styles.productText}>
                            {STRING_CONSTANTS.description_label}:{' '}
                            {item.product_name}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.product_quantity}: {item.quantity}
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.labor_label}: {item.labour}
                          </Text>
                          <Text style={styles.productAmountText}>
                            {STRING_CONSTANTS.product_amount_sign}
                            {item.amount}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                ))}
                {timeSheet.map((item, index) => (
                  <View key={index}>
                    {windowWidth > 700 ? (
                      <View style={styles.bodyRow}>
                        <Text style={[styles.bodyCell, {flex: 1}]}>1</Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          {STRING_CONSTANTS.td_time_title}
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 2}]}>
                          Travel and Diagnostic Time
                        </Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>-</Text>
                        <Text style={[styles.bodyCell, {flex: 1}]}>
                          {item.total}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.productsView}>
                          <Text style={styles.productCodeText}>
                            {STRING_CONSTANTS.td_time_title}
                          </Text>
                          <Text numberOfLines={1} style={styles.productText}>
                            {STRING_CONSTANTS.description_label}:
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.product_quantity}: 1
                          </Text>
                          <Text style={styles.productText}>
                            {STRING_CONSTANTS.labor_label}: 0
                          </Text>
                          <Text style={styles.productAmountText}>
                            {STRING_CONSTANTS.product_amount_sign}
                            {item.total}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.MainContainer}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#B2B9BF',
                    padding: 8,
                    marginVertical: 10,
                    marginHorizontal: 5,
                    borderRadius: 3,
                    backgroundColor: windowWidth > 700 ? '#fff' : '#F5F5F5',
                  }}>
                  {invoices.map((item, index) => (
                    <View key={index}>
                      <View style={styles.invoicesDataView}>
                        <Text style={styles.invoicesText}>
                          Service Agreements
                        </Text>
                        <Text style={styles.invoicesText}>
                          {STRING_CONSTANTS.product_amount_sign} 0.00
                        </Text>
                      </View>
                      <View style={styles.invoicesDataView}>
                        <Text style={styles.invoicesTotalText}>
                          {STRING_CONSTANTS.total_ticket_details}
                        </Text>
                        <Text style={styles.invoicesTotalText}>
                          {STRING_CONSTANTS.product_amount_sign}
                          {item.total}
                        </Text>
                      </View>
                      <View style={styles.invoicesDataView}>
                        <Text style={styles.invoicesText}>Paid</Text>
                        <Text style={styles.invoicesText}>
                          {STRING_CONSTANTS.product_amount_sign}
                          {item.paid}
                        </Text>
                      </View>
                      <View style={styles.invoicesDataView}>
                        <Text style={styles.invoicesText}>
                          {STRING_CONSTANTS.balance_due}
                        </Text>
                        <Text style={styles.invoicesText}>
                          {STRING_CONSTANTS.product_amount_sign}{' '}
                          {item.balance ? item.balance : '0.00'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                {invoices.map((item, index) => (
                  <View key={index}>
                    <View
                      style={{
                        justifyContent: 'flex-end',
                        alignSelf: 'flex-end',
                        marginTop: 10,
                        marginHorizontal: 30,
                      }}>
                      <Image
                        style={{height: 120, width: 120}}
                        source={{
                          uri: `https://xr.logoflex.co.uk/assets/images/signature/${item.signature}`,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'black',
                        fontFamily: 'DMSans-Medium',
                        alignSelf: 'flex-end',
                        marginHorizontal: 30,
                      }}>
                      Signature_____________
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <ActivityIndicator size={30} color="#000000" />
          )
        ) : (
          <Text style={styles.invoicesTotalText}>No invoice available</Text>
        )}
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
};

export default DownloadScreen;

const styles = StyleSheet.create({
  TittleScreen: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    padding: 20,
    textAlign: 'center',
  },
  Tittle: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    padding: 10,
  },
  MainContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  DataView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingVertical: 10,
  },
  ClientName: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 25,
    padding: 8,
    paddingLeft: 30,
  },
  EmailView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 30,
  },
  ImageIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: 'black',
  },
  ClientData: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    padding: 8,
  },
  productsView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B2B9BF',
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
  productCodeText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    padding: 2,
  },
  productText: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
    padding: 2,
  },
  productAmountText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    padding: 2,
    alignSelf: 'flex-end',
  },
  invoicesDataView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  invoicesDateView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  invoicesText: {
    color: '#4B4B4B',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    padding: 2,
  },
  invoicesTotalText: {
    color: '#000000',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    padding: 2,
  },
  PdfDownloadButton: {
    padding: 5,
    borderWidth: 0.5,
    borderRadius: 5,
    borderColor: '#cccccc',
    backgroundColor: '#ff5d48',
    flexDirection: 'row',
    alignItems: 'center',
  },
  PdfDownloadButtonText: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    marginHorizontal: 5,
  },
  // Tab View Styling
  container: {flex: 1, padding: 16, paddingTop: 30},
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#4d4d4d',
    borderWidth: 0.5,
    borderColor: '#4d4d4d',
  },
  headerCell: {
    padding: 10,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#C1C0B9',
    color: '#fff',
    fontFamily: 'DMSans-Bold',
  },
  bodyRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#cccccc',
  },
  bodyCell: {
    padding: 10,
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#C1C0B9',
    fontFamily: 'DMSans-Medium',
  },
});
