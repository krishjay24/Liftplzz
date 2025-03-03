import { StatusBar } from "expo-status-bar";
import { StyleSheet} from "react-native";
import Login from "./src/components/Login";
import SignUp from "./src/components/SignUp";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./src/components/SplashScreen";
import GoogleMapScreen from "./src/screens/googlemaps";
import NavigatingScreens from "./src/components/NavigatingScreens";
import WatchAds from "./src/components/WatchAds";
import ProfilePage from "./src/components/ProfilePage";
import PickerIndex from "./src/screens/googlemaps/PickerIndex";
import ConfirmYouRide from "./src/components/ConfirmYouRide";
import PickerDetailsPage from "./src/components/PickerDetailsPage";
import TrackIndex from "./src/screens/googlemaps/TrackIndex";
import DriverLogin from "./src/components/DriverLogin";
import DriverSignup from "./src/components/DriverSignup";
import DriverProfilePage from "./src/components/DriverProfilePage";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DriverLogin"
          component={DriverLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DriverSignup"
          component={DriverSignup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GoogleMapScreen"
          component={GoogleMapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NavigatingScreens"
          component={NavigatingScreens}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WatchAds"
          component={WatchAds}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfilePage"
          component={ProfilePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DriverProfilePage"
          component={DriverProfilePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PickerIndex"
          component={PickerIndex}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConfirmYouRide"
          component={ConfirmYouRide}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PickerDetailsPage"
          component={PickerDetailsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TrackIndex"
          component={TrackIndex}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({});
