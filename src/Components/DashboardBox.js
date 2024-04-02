import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import URL_CONFIG from './global-config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import STRING_CONSTANTS from '../strings/strings';
import NAVIGATION_STRING_CONSTANTS from '../navigation/NavigarionStringConstants';
export default function DashboardBox() {
  const navigation = useNavigation();
  const [openTicket, setOpenTicket] = useState();
  const [closeTicket, setCloseTicket] = useState();
  const [upcomingTicket, setUpcomingTicket] = useState();

  /**
   * Triggers when user navigation screen is focused
   */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Triggers when user back navigation screen is focused
   */

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, []),
  );

  /**
   * Fetch Dashboard Tickets Open,Close & UP upcomingTicket
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
          setOpenTicket(newData.openTicket);
          setCloseTicket(newData.closeTicket);
          setUpcomingTicket(newData.scheduleTicket);
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

  return (
    <View style={styles.MainContainer}>
      <TouchableOpacity
        style={styles.BoxContainer}>
        <Text style={styles.DataNameText}>{openTicket}</Text>
        <Text style={styles.DataText}>{STRING_CONSTANTS.open_ticket}</Text>
        <Text style={styles.DataTextSecond}>{STRING_CONSTANTS.tickets}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.BoxContainer}>
        <Text style={styles.DataNameText}>{closeTicket}</Text>
        <Text style={styles.DataText}>{STRING_CONSTANTS.close_ticket}</Text>
        <Text style={styles.DataTextSecond}>{STRING_CONSTANTS.tickets}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.BoxContainer}>
        <Text style={styles.DataNameText}>{upcomingTicket}</Text>
        <Text style={styles.DataText}>{STRING_CONSTANTS.up_coming_ticket}</Text>
        <Text style={styles.DataTextSecond}>{STRING_CONSTANTS.tickets}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  BoxContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContentL: 'center',
    alignItems: 'center',
    margin: 10,
    borderColor: '#B2B9BF',
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  DataText: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    marginTop: 5,
  },
  DataTextSecond: {
    color: '#333333',
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
  },
  DataNameText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '900',
  },
});
