import MapViewDirections from "react-native-maps-directions";
import "react-native-get-random-values";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MapView, {
  Callout,
  Circle,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { apiKey } from "../../utils/apiKey";
import GetLocation from "react-native-get-location";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import RBSheet from "react-native-raw-bottom-sheet";
import { BASE_URL } from "../../utils/apiConfig";

const TrackIndex = ({ navigation }) => {
  const mapRef = useRef(null);

  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [originPlace, setOriginPlace] = useState("");
  const [destinationPlace, setDestinationPlace] = useState("");

  const [pickersRoute, setPickersRoute] = useState([]);
  const [isPickerRouteConfirmed, setPickerIsRouteConfirmed] = useState(false); // State to enable/disable route

  const [ridersRoute, setRidersRoute] = useState([]);
  const [isRidersRouteConfirmed, setRidersIsRouteConfirmed] = useState(false); // State to enable/disable route

  useEffect(() => {
    _getLocationPermission();
    fetchPickerRoute();
    setPickerIsRouteConfirmed(true); // Enable the route
    fetchRiderRoute();
    setRidersIsRouteConfirmed(true);
  }, []);

  async function _getLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please allow location access to use this feature."
      );
      return;
    }
    setPermissionGranted(true);
    _getCurrentLocation(); // Call location fetching method after permission
  }

  async function _getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log("Location: ", location);
      // Update userLocation state with current coordinates
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      // Move map to current location
      moveToLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Error getting location: ", error.message);
      Alert.alert("Error", "Unable to fetch location. Try again later.");
    }
  }

  async function moveToLocation(latitude, longitude) {
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      2000
    );
  }

  const fetchPickerRoute = async () => {
    try {
      const response = await fetch(`${BASE_URL}/picker`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(
        "Response from Backend (picker):",
        responseData.current_route
      );
      setPickersRoute(responseData.current_route);
    } catch (error) {
      console.error("Error fetching picker route:", error);
    }
  };

  const fetchRiderRoute = async () => {
    try {
      const response = await fetch(`${BASE_URL}/rider`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log(
        "Response from Backend (picker):",
        responseData.current_route
      );
      setRidersRoute(responseData.current_route);
    } catch (error) {
      console.error("Error fetching rider route:", error);
    }
  };

  if (!permissionGranted)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Please Allow Location permission to continue...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: 17.44688,
          longitude: 78.39104,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {origin && (
          <Marker coordinate={origin} title="Origin" pinColor="#6200ee" />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="#6200ee"
          />
        )}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={100}
            strokeColor="rgba(0, 150, 255, 0.7)"
            fillColor="rgba(0, 150, 255, 0.2)"
          />
        )}

        {/* {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={apiKey}
            strokeWidth={3}
            strokeColor="#000"
            optimizeWaypoints={true}
            onReady={async (result) => {
              console.log("Route Information:", result);
              console.log("Route Starts:", result.legs[0].start_address);
              console.log("Route Ends:", result.legs[0].end_address);
              setOriginPlace(result.legs[0].start_address);
              setDestinationPlace(result.legs[0].end_address);
              // Adjust the map to fit the route
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: 30,
                  bottom: 300,
                  left: 30,
                  top: 100,
                },
              });

              // Perform POST request to the backend
              try {
                const response = await fetch(`${BASE_URL}/match`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    origin: {
                      lat: origin.latitude,
                      lng: origin.longitude,
                    },
                    destination: {
                      lat: destination.latitude,
                      lng: destination.longitude,
                    },
                    routeDetails: result, // Send the full result for backend processing
                  }),
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();
                console.log(
                  "Response from Backend:",
                  responseData.pickers_route
                );
                // Plot pickers' routes
                setPickersRoute(responseData.pickers_route); // Store the pickers' route in state
              } catch (error) {
                // console.error("Error sending data to backend:", error);
              }
            }}
          />
        )} */}

        {isPickerRouteConfirmed && pickersRoute && pickersRoute.length > 0 && (
          <>
            {pickersRoute.length === 2 && (
              <MapViewDirections
                origin={{
                  latitude: pickersRoute[0].lat,
                  longitude: pickersRoute[0].lng,
                }}
                destination={{
                  latitude: pickersRoute[1].lat,
                  longitude: pickersRoute[1].lng,
                }}
                apikey={apiKey}
                strokeWidth={3}
                strokeColor="#000"
                optimizeWaypoints={true}
              />
            )}
            {pickersRoute.map((point, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: point.lat,
                  longitude: point.lng,
                }}
                title={`Picker ${index + 1}`}
                pinColor="#6200ee"
              />
            ))}
          </>
        )}

        {isRidersRouteConfirmed && ridersRoute && ridersRoute.length > 0 && (
          <>
            {ridersRoute.length === 2 && (
              <MapViewDirections
                origin={{
                  latitude: ridersRoute[0].lat,
                  longitude: ridersRoute[0].lng,
                }}
                destination={{
                  latitude: ridersRoute[1].lat,
                  longitude: ridersRoute[1].lng,
                }}
                apikey={apiKey}
                strokeWidth={3}
                strokeColor="rgba(0, 150, 255, 0.7)"
                optimizeWaypoints={true}
              />
            )}
            {ridersRoute.map((point, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: point.lat,
                  longitude: point.lng,
                }}
                title={`Picker ${index + 1}`}
                pinColor="red"
              />
            ))}
          </>
        )}
      </MapView>

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={_getCurrentLocation}
      >
        <Icon name="my-location" size={25} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default TrackIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 25,
    width: "90%",
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
    flexDirection: "column",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 35,
    height: 35,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  calloutText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  iconLocation: {
    position: "absolute",
    top: 5,
    right: 0,
    zIndex: 99999,
  },
  currentLocationButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer2: {},
  bottombutton2: {
    width: 90,
    height: 90,
    borderRadius: 5,
    backgroundColor: "#6200ee",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText2: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  bottombuttonLiftPlzz: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonTextliftplzz: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
