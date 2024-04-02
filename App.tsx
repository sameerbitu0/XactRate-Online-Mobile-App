import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Splash_Screen from './src/SplashScreen';
import Login from './src/Login';
import ResetPassword from './src/ResetPassword';
import Home from './src/HomeScreen';
import Schedule from './src/ScheduleScreen';
import Clients from './src/ClientsScreen';
import AllTickets from './src/AllTicketsScreen';
import Ticket from './src/TicketScreen';
import Create_Client from './src/CreateClient';
import Create_Ticket from './src/CreateTicket';
import Edit_Ticket from './src/EditTicket';
import CustomDrawer from './src/Components/CustomDrawer';
import ClientTickets from './src/ClientTickets';

import * as Sentry from '@sentry/react-native';
import {Dimensions} from 'react-native';
import MobileInvoice from './src/MobileInvoice';
import TicketDetail from './src/TicketDetailScreen';
import NAVIGATION_STRING_CONSTANTS from './src/navigation/NavigarionStringConstants';

Sentry.init({
  dsn: 'https://3d9b405424ad4224afcb9a0fb1aa2c3f@o4504920315789312.ingest.sentry.io/4504920323719168',
});

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerComponent() {
  
  return (
    <Drawer.Navigator      
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#5dbf06',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontFamily: 'DMSans-Bold',
          fontSize: 15,
        },
      }}>
      <Drawer.Screen
        name={NAVIGATION_STRING_CONSTANTS.home_screen}
        component={Home}
        options={{
          title: 'Dashboard',
          headerTitleStyle: {fontFamily: 'DMSans-Bold'},
          headerTitleAlign: 'center',
          headerShown: true,
          headerStyle: {backgroundColor: '#F5F5F5'},
        }}
      />
      <Drawer.Screen
        name={NAVIGATION_STRING_CONSTANTS.schedule_screen}
        component={Schedule}
        options={{
          title: 'Schedule',
          headerTitleStyle: {fontFamily: 'DMSans-Bold'},
          headerTitleAlign: 'center',
          headerShown: true,
          headerStyle: {backgroundColor: '#F5F5F5'},
        }}
      />
      <Drawer.Screen
        name={NAVIGATION_STRING_CONSTANTS.clients_screen}
        component={Clients}
        options={{
          title: 'Clients',
          headerTitleStyle: {fontFamily: 'DMSans-Bold'},
          headerTitleAlign: 'center',
          headerShown: true,
          headerStyle: {backgroundColor: '#F5F5F5'},
        }}
      />
      
      <Drawer.Screen
        name={NAVIGATION_STRING_CONSTANTS.details_screen}
        component={AllTickets}
        options={{
          title: 'All Tickets',
          headerTitleStyle: {fontFamily: 'DMSans-Bold'},
          headerTitleAlign: 'center',
          headerShown: true,
          headerStyle: {backgroundColor: '#F5F5F5'},
        }}
      />
      
    </Drawer.Navigator>
  );
}

/**
 * Screen Navigation 
 */

function App() {
  const windowWidth = Dimensions.get('window').width;
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    changeOrientation();
  }, []);

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

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.splash_screen}
          component={Splash_Screen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.login_screen}
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.reset_password_screen}
          component={ResetPassword}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Root"
          component={DrawerComponent}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.create_client_screen}
          component={Create_Client}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.client_tickets_screen}
          component={ClientTickets}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.create_ticket_screen}
          component={Create_Ticket}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.edit_ticket_screen}
          component={Edit_Ticket}
          options={{
            headerShown: false,
          }}
        />
        {windowWidth > 700 && (
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.ticket_screen}
          component={Ticket}
          options={{
            headerShown: false,
          }}
        />
      )}
        {windowWidth < 700 && (
          <Stack.Screen
            name={NAVIGATION_STRING_CONSTANTS.ticket_screen}
            component={MobileInvoice}
            options={{
              headerShown: false,
            }}
          />
        )}
        <Stack.Screen
          name={NAVIGATION_STRING_CONSTANTS.download_screen}
          component={TicketDetail}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default Sentry.wrap(App);
