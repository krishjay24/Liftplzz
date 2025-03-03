import MapViewDirections from "react-native-maps-directions";
import "react-native-get-random-values";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Button,
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
import User from "react-native-vector-icons/FontAwesome6";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import RBSheet from "react-native-raw-bottom-sheet";
import { BASE_URL } from "../../utils/apiConfig";

const PickerIndex = ({ navigation }) => {
  const mapRef = useRef(null);
  const bottomSheetRef = useRef();
  const bottomSheetRefTwo = useRef(null);

  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rideStatus, setRideStatus] = useState("Waiting...");
  const [rideId, setRideId] = useState("12345"); // Example ride ID
  const [userRole, setUserRole] = useState("driver"); // Example user role

  const openBottomSheet = () => {
    bottomSheetRef.current.open();
  };

  useEffect(() => {
    if (origin && destination) {
      openBottomSheet(); // Open the bottom sheet when origin and destination are set
    }
  }, [origin, destination]); // This effect will trigger when either origin or destination is updated

  useEffect(() => {
    _getLocationPermission();
  }, []);

  // useEffect(() => {
  //   const fetchRideRequests = async () => {
  //     try {
  //       setLoading(true);
  //       const driverId = 1; // Replace with actual driver ID
  //       const response = await fetch(
  //         `${BASE_URL}/driver/rides?driver_id=${driverId}`
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch ride requests");

  //       const data = await response.json();
  //       setRideRequests(data.ride_requests.slice(0, 8)); // Limit to 8 items
  //     } catch (error) {
  //       console.error("Error fetching rides:", error);
  //       Alert.alert("Error", "Could not load ride requests.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRideRequests();
  // }, []);

  // useEffect(() => {
  //   const fetchRideRequests = async () => {
  //     try {
  //       setLoading(true);
  //       const driverId = 1; // Replace with actual driver ID
  //       const response = await fetch(
  //         `${BASE_URL}/driver/rides?driver_id=${driverId}`
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch ride requests");

  //       const data = await response.json();
  //       setRideRequests(data.ride_requests); // Fetch all ride requests
  //     } catch (error) {
  //       console.error("Error fetching rides:", error);
  //       Alert.alert("Error", "Could not load ride requests.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRideRequests();
  // }, []);

  // useEffect(() => {
  //   let interval; // declare interval variable to clear later

  //   const fetchRideRequests = async () => {
  //     try {
  //       setLoading(true);
  //       const driverId = 1; // Replace with the actual driver ID if needed
  //       const response = await fetch(
  //         `${BASE_URL}/driver/rides?driver_id=${driverId}`
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch ride requests");

  //       const data = await response.json();
  //       if (data.ride_requests && data.ride_requests.length > 0) {
  //         setRideRequests(data.ride_requests); // Update state with all ride requests
  //         clearInterval(interval); // Stop polling once rides are available
  //       } else {
  //         setRideRequests([]); // No rides available, keep polling
  //       }
  //     } catch (error) {
  //       console.error("Error fetching rides:", error);
  //       Alert.alert("Error", "Could not load ride requests.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Initial fetch
  //   fetchRideRequests();

  //   // Set up polling every 3 seconds
  //   interval = setInterval(() => {
  //     fetchRideRequests();
  //   }, 3000);

  //   // Cleanup interval on unmount
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   let intervalId; // Use a local variable for cleanup

  //   const fetchRideRequests = async () => {
  //     try {
  //       setLoading(true);
  //       const driverId = 1; // Replace with actual driver ID
  //       const response = await fetch(
  //         `${BASE_URL}/driver/rides?driver_id=${driverId}`
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch ride requests");

  //       const data = await response.json();
  //       if (data.ride_requests && data.ride_requests.length > 0) {
  //         setRideRequests(data.ride_requests); // Update state with ride requests
  //         clearInterval(intervalId); // Stop polling when data is available
  //       } else {
  //         setRideRequests([]); // Keep polling if no rides
  //       }
  //     } catch (error) {
  //       console.error("Error fetching rides:", error);
  //       Alert.alert("Error", "Could not load ride requests.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Fetch initially and start polling
  //   fetchRideRequests();
  //   intervalId = setInterval(fetchRideRequests, 3000);

  //   // Cleanup interval when component unmounts
  //   return () => clearInterval(intervalId);
  // }, []); // Empty dependency array ensures it runs only on mount

  let intervalId;

  const fetchRideRequests = async () => {
    try {
      setLoading(true);
      const driverId = 1; // Replace with actual driver ID
      const response = await fetch(
        `${BASE_URL}/driver/rides?driver_id=${driverId}`
      );
      if (!response.ok) throw new Error("Failed to fetch ride requests");

      const data = await response.json();
      if (data.ride_requests && data.ride_requests.length > 0) {
        setRideRequests(data.ride_requests); // Update state with ride requests
        clearInterval(intervalId); // Stop polling when data is available
      } else {
        setRideRequests([]); // Keep polling if no rides
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      Alert.alert("Error", "Could not load ride requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initially and start polling
    fetchRideRequests();
    intervalId = setInterval(fetchRideRequests, 3000);

    // Cleanup interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // // Function to fetch ride status
  // const fetchRideStatus = async () => {
  //   if (!rideId) return; // Ensure rideId is available

  //   try {
  //     console.log("Fetching ride status for:", rideId); // Debugging
  //     const response = await fetch(`${BASE_URL}/ride_status/${rideId}`);

  //     if (!response.ok) throw new Error("Ride not found");

  //     const data = await response.json();
  //     setRideStatus(data.status);
  //   } catch (error) {
  //     console.error("Error fetching ride status:", error);
  //     setRideStatus("Error: Ride not found"); // Set a fallback error status
  //   }
  // };

  // // Poll for ride status every 5 seconds
  // useEffect(() => {
  //   if (!rideId) return;

  //   fetchRideStatus(); // Initial fetch

  //   const interval = setInterval(fetchRideStatus, 5000);
  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, [rideId]);

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

  // const handleAccept = (rideId) => {
  //   Alert.alert("Ride Accepted", `Ride ID: ${rideId} has been accepted.`);
  // };

  // const handleCancel = (rideId) => {
  //   Alert.alert("Ride Canceled", `Ride ID: ${rideId} has been canceled.`);
  // };

  // Updated handleAccept function
  // const handleAccept = async (rideId) => {
  //   try {
  //     // Call the backend endpoint with the rideId as a URL parameter
  //     const response = await fetch(`${BASE_URL}/ride/accept/${rideId}`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       // No body needed since rideId is part of the URL
  //     });
  //     if (!response.ok) {
  //       throw new Error(`Failed to accept ride: ${response.status}`);
  //     }
  //     Alert.alert("Ride Accepted", `Ride ID: ${rideId} has been accepted.`);
  //   } catch (error) {
  //     console.error("Ride accept error:", error);
  //     Alert.alert("Error", "There was a problem accepting the ride.");
  //   }
  // };

  const handleAccept = async (rideId) => {
    try {
      const response = await fetch(`${BASE_URL}/ride/accept/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to accept ride: ${response.status}`);
      }

      Alert.alert("Ride Accepted", `Ride ID: ${rideId} has been accepted.`);

      // Send an event or update the database so the passenger gets notified
    } catch (error) {
      console.error("Ride accept error:", error);
      Alert.alert("Error", "There was a problem accepting the ride.");
    }
  };

  // Updated handleCancel function (assuming a similar backend endpoint exists)
  const handleCancel = async (rideId) => {
    try {
      // Adjust the endpoint if needed, e.g., /ride/cancel/<rideId>
      const response = await fetch(`${BASE_URL}/ride/cancel/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No body needed here either
      });
      if (!response.ok) {
        throw new Error(`Failed to cancel ride: ${response.status}`);
      }
      Alert.alert("Ride Canceled", `Ride ID: ${rideId} has been canceled.`);
    } catch (error) {
      console.error("Ride cancel error:", error);
      Alert.alert("Error", "There was a problem canceling the ride.");
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
      <View style={styles.searchContainer}>
        <View
          style={{
            flex: 0.5,
            borderBottomWidth: 1,
            borderColor: "#6200ee",
            position: "relative",
          }}
        >
          <Icon
            name="location-pin"
            color="green"
            size={25}
            style={styles.iconLocation}
          />
          <GooglePlacesAutocomplete
            placeholder="Origin"
            fetchDetails={true}
            onPress={(data, details = null) => {
              let originCordinates = {
                latitude: details?.geometry?.location.lat,
                longitude: details?.geometry?.location.lng,
              };
              setOrigin(originCordinates);
              moveToLocation(originCordinates);
              moveToLocation(
                originCordinates.latitude,
                originCordinates.longitude
              );
            }}
            query={{
              key: apiKey,
              language: "en",
            }}
            styles={{
              container: {
                flex: 0,
                position: "relative",
                width: "100%",
                zIndex: 1,
              },
              textInput: {
                height: 30,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontSize: 15,
                flex: 1,
              },
              listView: {
                position: "absolute",
                top: 81.5,
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: 5,
                flex: 1,
                elevation: 3,
                zIndex: 1000,
              },
              row: {
                padding: 13,
                height: 44,
                flexDirection: "row",
              },
              separator: {
                height: 0.5,
                backgroundColor: "#c8c7cc",
              },
            }}
            onFail={(error) => console.log(error)}
          />
        </View>
        <View
          style={{
            flex: 0.5,
            borderTopWidth: 0.5,
            borderColor: "#6200ee",
            position: "relative",
          }}
        >
          <Icon
            name="location-pin"
            color="red"
            size={25}
            style={styles.iconLocation}
          />
          <GooglePlacesAutocomplete
            placeholder="Destination"
            fetchDetails={true}
            onPress={(data, details = null) => {
              let destinationCordinates = {
                latitude: details?.geometry?.location.lat,
                longitude: details?.geometry?.location.lng,
              };
              setDestination(destinationCordinates);
              moveToLocation(destinationCordinates);
              moveToLocation(
                destinationCordinates.latitude,
                destinationCordinates.longitude
              );
            }}
            query={{
              key: apiKey,
              language: "en",
            }}
            styles={{
              container: {
                flex: 0,
                position: "relative",
                width: "100%",
                zIndex: 1,
              },
              textInput: {
                height: 30,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontSize: 15,
                flex: 1,
              },
              listView: {
                position: "absolute",
                top: 45,
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: 5,
                flex: 1,
                elevation: 3,
                zIndex: 1000,
              },
              row: {
                padding: 13,
                height: 44,
                flexDirection: "row",
              },
              separator: {
                height: 0.5,
                backgroundColor: "#c8c7cc",
              },
            }}
            onFail={(error) => console.log(error)}
          />
        </View>
      </View>
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

        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={apiKey}
            strokeWidth={3}
            strokeColor="#000"
            optimizeWaypoints={true}
            onReady={async (result) => {
              console.log("Route Information:", result);

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
                const response = await fetch(`${BASE_URL}/picker`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    routeDetails: {
                      coordinates: result.coordinates.map((coord) => ({
                        lat: coord.latitude,
                        lng: coord.longitude,
                      })),
                    },
                  }),
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();
                console.log("Response from Backend:", responseData);
              } catch (error) {
                console.error("Error sending data to backend:", error);
              }
            }}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={_getCurrentLocation}
      >
        <Text style={{ color: "#fff", fontSize: 8, textAlign: "center" }}>
          Driver
        </Text>
        <Icon name="my-location" size={25} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("DriverProfilePage")}
      >
        <User name="circle-user" size={40} color="#fff" />
      </TouchableOpacity>
      <RBSheet
        ref={bottomSheetRef}
        closeOnPressMask={true}
        draggable={true}
        height={300}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            elevation: 5,
          },
          wrapper: {
            backgroundColor: "transparent",
          },
          handle: {
            width: 50,
            height: 5,
            borderRadius: 10,
            alignSelf: "center",
          },
        }}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            bottomSheetRef.current.close();
            bottomSheetRefTwo.current.open();
            console.log("Clicked Confirm My Directions");
          }}
        >
          <Text style={styles.buttonTextConfirm}>Confirm My Directions</Text>
        </TouchableOpacity>
      </RBSheet>

      <RBSheet
        ref={bottomSheetRefTwo}
        closeOnPressMask={true} // Prevent closing when pressing outside
        draggable={true}
        height={600}
        openDuration={250}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          handle: {
            width: 100,
            height: 0,
            borderRadius: 10,
            alignSelf: "center",
          },
        }}
      >
        {/* <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <TouchableOpacity
            style={styles.bottombutton2}
            onPress={() =>
              // navigation.navigate("ProfilePage")
              console.log("Clicked Your Wallet")
            }
          >
            <Text style={styles.buttonText2}>Your Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottombutton2}
            onPress={() => {
              // navigation.navigate("WatchAds");
              console.log("Clicked Earned Points");
            }}
          >
            <Text style={styles.buttonText2}>Earned Points</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={styles.bottombuttonLiftPlzz}
            onPress={() => console.log("Clicked Lift Plzz")}
          >
            <Text style={styles.buttonTextliftplzz}>Lift Plzz</Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.containerTwo}>
          <Text style={styles.title}>
            Ride Requests ({rideRequests.length})
          </Text>
          {/* Button to manually refresh ride requests */}
          <Button title="Refresh Requests" onPress={fetchRideRequests} />
          {loading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : rideRequests.length > 0 ? (
            <ScrollView style={styles.scrollContainer}>
              {rideRequests.map((ride) => (
                <View key={ride.id} style={styles.rideCard}>
                  <Text style={styles.label}>User ID: {ride.user_id}</Text>
                  <Text style={styles.label}>
                    Pickup: {ride.pickup_location}
                  </Text>
                  <Text style={styles.label}>
                    Dropoff: {ride.dropoff_location}
                  </Text>
                  <Text style={styles.fare}>Fare: ₹{ride.fare}</Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      onPress={() => handleCancel(ride.id)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.buttonText}>❌ Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleAccept(ride.id);
                        navigation.navigate("TrackIndex");
                      }}
                      style={styles.acceptButton}
                    >
                      <Text style={styles.buttonText}>✔️ Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noRequests}>No ride requests available.</Text>
          )}
        </View>

        {/* <View style={styles.container}>
          <Text style={styles.status}>Ride Status: {rideStatus}</Text>
          {userRole === "driver" && (
            <Text style={styles.updateText}>
              Update your ride status here...
            </Text>
          )}
        </View> */}
      </RBSheet>
    </View>
  );
};

export default PickerIndex;

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
  profileButton: {
    position: "absolute",
    left: 10,
    bottom: 40,
    backgroundColor: "#6200ee", // Black background
    padding: 4,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
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
  buttonTextConfirm: {
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

  containerTwo: {
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    flex: 1,
    paddingBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  scrollContainer: {
    // maxHeight: 300,
  },
  rideCard: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 2,
  },
  fare: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  acceptButton: {
    padding: 10,
    backgroundColor: "#28a745",
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noRequests: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },

  status: {
    fontSize: 18,
    fontWeight: "bold",
  },
  updateText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
});
