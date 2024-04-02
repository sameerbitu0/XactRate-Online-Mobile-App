import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  BackHandler,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import URL_CONFIG from './Components/global-config';
import STRING_CONSTANTS from './strings/strings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './Components/BottomTabBar';
import {useNavigation} from '@react-navigation/native';

export default function Create_Client() {
  const navigation = useNavigation();
  //// Variable initialization  ////

  const [errorMessage, setErrorMessage] = useState(false);
  const [fName, setFname] = useState();
  const [lName, setLname] = useState();
  const [email, setEmail] = useState();
  const [phoneNo1, setPhoneNo1] = useState();
  const [phoneNo2, setPhoneNo2] = useState();
  const [jobAddress1, setJobAddress1] = useState();
  const [jobAddress2, setJobAddress2] = useState();
  const [city, setCity] = useState();
  const [state, setState] = useState();
  const [zipPostal, setZipPostal] = useState();
  // Next Form
  const [billingAddress1, setBillingAddress1] = useState();
  const [billingAddress2, setBillingAddress2] = useState();
  const [billingCity, setBillingCity] = useState();
  const [billingState, setBillingState] = useState();
  const [billingZipPostal, setBillingZipPostal] = useState();
  const [notes, setNotes] = useState();
  const [clientType, setClientType] = useState();
  const [selectTab, setSelectTab] = useState(0);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const toggleLoading = () => {
    setLoading(!loading);
  };

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    setClientType('Organization');
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  function handleValueChange(Type = '') {
    setClientType(Type);
  }

  function errorReturn() {
    if (errorMessage) {
      return <Text style={styles.ErrorMessage}>{errorMessage}</Text>;
    } else {
      return null;
    }
  }
  // Email valediction Variable
  const validateEmail = text => {
    // Regex pattern to validate email addresses
    const regexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setEmail(text);
    setIsValidEmail(regexPattern.test(text));
    setErrorMessage('');
  };

  ////  API   ////
  const Submit = async () => {
    var userToken = await AsyncStorage.getItem('userToken');
    if (!fName) {
      setErrorMessage(STRING_CONSTANTS.client_fname_required);
    } else if (!lName) {
      setErrorMessage(STRING_CONSTANTS.client_lname_required);
    } else if (!isValidEmail) {
      setErrorMessage(STRING_CONSTANTS.enter_valid_email_text);
    } else if (!phoneNo1) {
      setErrorMessage(STRING_CONSTANTS.client_phone_no_required);
    } else {
      toggleLoading();
      fetch(URL_CONFIG.Url + 'api/clients/save', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          fname: fName,
          lname: lName,
          email: email,
          phone_no_1: phoneNo1,
          phone_no_2: phoneNo2,
          job_address_1: jobAddress1,
          job_address_2: jobAddress2,
          city: city,
          state: state,
          zip_postal: zipPostal,
          billing_address_1: billingAddress1,
          billing_address_2: billingAddress2,
          billing_city: billingCity,
          billing_state: billingState,
          billing_zip_postal: billingZipPostal,
          notes: notes,
          client_type: clientType,
        }),
      })
        .then(response => response.json())
        .then(async data => {
          toggleLoading();
          if (data.success == true) {
            //console.log(data);
            navigation.navigate('Root', {
              screen: NAVIGATION_STRING_CONSTANTS.clients_screen,
            });
          } else {
            Alert.alert(data.message);
          }
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  ////  API End  ////

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F5F5F5'}}>
      <Text style={styles.ScreenTittle}>Create Client</Text>
      <ScrollView>
        <View style={styles.SwitchSelectorMainContainer}>
          <View style={styles.SwitchSelectorContainer}>
            <TouchableOpacity
              style={{
                width: '50%',
                height: 35,
                backgroundColor: selectTab == 0 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                handleValueChange(
                  (Type = STRING_CONSTANTS.organization_label_text),
                ) + setSelectTab(0)
              }>
              <Text
                style={{
                  color: selectTab == 0 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.organization_label_text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: '50%',
                height: 35,
                backgroundColor: selectTab == 1 ? '#5dbf06' : 'white',
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                handleValueChange(
                  (Type = STRING_CONSTANTS.individual_label_text),
                ) + setSelectTab(1)
              }>
              <Text
                style={{
                  color: selectTab == 1 ? '#fff' : '#000000',
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                }}>
                {STRING_CONSTANTS.individual_label_text}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.MainContainer}>
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.first_name_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.first_name_label_text}
            placeholderTextColor="#c0c0c0"
            value={fName}
            onChangeText={fname => {
              setFname(fname);
              setErrorMessage('');
            }}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.last_name_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.last_name_label_text}
            placeholderTextColor="#c0c0c0"
            value={lName}
            onChangeText={lname => {
              setLname(lname);
              setErrorMessage('');
            }}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.email_label_text}
          </Text>
          <TextInput
            keyboardType="email-address"
            autoCorrect={false}
            placeholder="client@mail.com"
            autoCapitalize="none"
            placeholderTextColor="#c0c0c0"
            value={email}
            onChangeText={validateEmail}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.phone_no_1_label_text}
          </Text>
          <TextInput
            keyboardType="phone-pad"
            maxLength={14}
            autoCorrect={false}
            placeholder="(xxx)xxx-xxxx"
            placeholderTextColor="#c0c0c0"
            value={phoneNo1}
            onChangeText={phone_no_1 => {
              setPhoneNo1(phone_no_1);
              setErrorMessage('');
            }}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.phone_no_2_label_text}
          </Text>
          <TextInput
            keyboardType="phone-pad"
            maxLength={14}
            autoCorrect={false}
            placeholder="(xxx)xxx-xxxx"
            placeholderTextColor="#c0c0c0"
            value={phoneNo2}
            onChangeText={phone_no_2 => setPhoneNo2(phone_no_2)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.address_line_1_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder="Address Line"
            placeholderTextColor="#c0c0c0"
            value={jobAddress1}
            onChangeText={job_address_1 => setJobAddress1(job_address_1)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.address_line_2_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder="Address Line"
            placeholderTextColor="#c0c0c0"
            value={jobAddress2}
            onChangeText={job_address_2 => setJobAddress2(job_address_2)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.city_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder="City"
            placeholderTextColor="#c0c0c0"
            value={city}
            onChangeText={city => setCity(city)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.state_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.state_label_text}
            placeholderTextColor="#c0c0c0"
            value={state}
            onChangeText={state => setState(state)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.zip_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.zip_label_text}
            placeholderTextColor="#c0c0c0"
            value={zipPostal}
            onChangeText={zip_postal => setZipPostal(zip_postal)}
            style={styles.InputField}
          />
          <Text style={styles.BillToAddressText}>BILL TO ADDRESS</Text>
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.address_line_1_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.address_line_1_label_text}
            placeholderTextColor="#c0c0c0"
            value={billingAddress1}
            onChangeText={billing_address_1 =>
              setBillingAddress1(billing_address_1)
            }
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.address_line_2_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.address_line_2_label_text}
            placeholderTextColor="#c0c0c0"
            value={billingAddress2}
            onChangeText={billing_address_2 =>
              setBillingAddress2(billing_address_2)
            }
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.city_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.city_label_text}
            placeholderTextColor="#c0c0c0"
            value={billingCity}
            onChangeText={billing_city => setBillingCity(billing_city)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.state_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.state_label_text}
            placeholderTextColor="#c0c0c0"
            value={billingState}
            onChangeText={billing_state => setBillingState(billing_state)}
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>
            {STRING_CONSTANTS.zip_label_text}
          </Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder={STRING_CONSTANTS.zip_label_text}
            placeholderTextColor="#c0c0c0"
            value={billingZipPostal}
            onChangeText={billing_zip_postal =>
              setBillingZipPostal(billing_zip_postal)
            }
            style={styles.InputField}
          />
          <Text style={styles.InputTextLabel}>Notes</Text>
          <TextInput
            keyboardType="default"
            autoCorrect={false}
            placeholder="Notes"
            placeholderTextColor="#c0c0c0"
            value={notes}
            onChangeText={notes => setNotes(notes)}
            style={styles.InputField}
          />
          {/* {refreshing ? (
            <ActivityIndicator
              size="large"
              color="#5dbf06"
              style={{margin: 20}}
            />
          ) : null} */}
          {errorReturn()}
          <TouchableOpacity
            style={styles.CreateButtonStyle}
            onPress={() => Submit()}>
            <Text style={styles.ButtonText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ButtonStyleCancel}
            onPress={() => navigation.goBack()}>
            <Text style={styles.ButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      <BottomTabBar />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    margin: 20,
  },
  InputTextLabel: {
    color: '#464646',
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    marginTop: 15,
    marginLeft: 5,
  },
  InputField: {
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    color: 'black',
    fontSize: 16,
    padding: 15,
    borderColor: '#B2B9BF',
    marginTop: 12,
    fontFamily: 'DMSans-Regular',
  },
  ScreenTittle: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    textAlign: 'center',
    margin: 20,
  },
  BillToAddressText: {
    color: 'black',
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    textAlign: 'center',
    margin: 20,
  },
  ErrorMessage: {
    marginVertical: 10,
    color: 'red',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
  },
  CreateButtonStyle: {
    backgroundColor: '#5dbf06',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
  },
  ButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
  },
  ButtonStyleCancel: {
    backgroundColor: '#D65F1C',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
    marginTop: 10,
  },
  SwitchSelectorMainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    borderRadius: 8,
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
});
