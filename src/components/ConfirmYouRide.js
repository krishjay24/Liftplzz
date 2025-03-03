import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { BASE_URL } from "../utils/apiConfig";

const ConfirmYouRide = ({ navigation }) => {
  const route = useRoute();
  const [pickersRoute, setPickersRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPicker, setSelectedPicker] = useState(null); // Only one driver can be selected

  const [isLoading, setIsLoading] = useState(false); // Loading state

  const [confirmedRideId, setConfirmedRideId] = useState(null);

  const { originPlace, destinationPlace } = route.params || {};

  useEffect(() => {
    const fetchPickerRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/all_picker`);
        if (!response.ok)
          throw new Error(`Failed to fetch pickers: ${response.status}`);

        const data = await response.json();
        if (!data.pickers_routes || data.pickers_routes.length === 0) {
          setPickersRoute([]);
          return;
        }

        const processedRoutes = await Promise.all(
          data.pickers_routes.map(async (picker) => {
            const [originCoord, destinationCoord] = picker.route;

            const getLocation = async (coord) => {
              try {
                const res = await fetch(`${BASE_URL}/get_location`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ lat: coord.lat, lng: coord.lng }),
                });

                if (!res.ok) return "Location unavailable";
                const locData = await res.json();
                return locData.location || "Unnamed location";
              } catch (error) {
                console.error("Location fetch error:", error);
                return "Error fetching location";
              }
            };

            const originAddress = await getLocation(originCoord);
            const destinationAddress = await getLocation(destinationCoord);

            return {
              driverId: picker.pickers_id,
              driverName: picker.pickers_name, // Assuming there's a name field
              origin: { ...originCoord, address: originAddress },
              destination: { ...destinationCoord, address: destinationAddress },
            };
          })
        );

        setPickersRoute(processedRoutes);
      } catch (error) {
        console.error("Fetch error:", error);
        Alert.alert("Error", "Failed to load pickers data");
      } finally {
        setLoading(false);
      }
    };

    fetchPickerRoutes();
  }, []);

  const handleConfirmRide = async () => {
    if (!selectedPicker) {
      Alert.alert("Select a driver", "Please select a driver.");
      return;
    }
    setIsLoading(true); // Show loading screen

    try {
      const response = await fetch(`${BASE_URL}/ride/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: selectedPicker.driverId,
          pickup_location: originPlace,
          dropoff_location: destinationPlace,
          fare: 10.0, // You can replace this with a dynamically calculated fare
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request ride: ${response.status}`);
      }

      const responseData = await response.json();

      checkRideStatus(responseData.ride_id); // Start polling for request_to_ride status

      Alert.alert("Success", "Ride request sent successfully!");
      setTimeout(() => {
        setIsLoading(false); // Hide loading screen after 5 seconds
        navigation.navigate("PickerDetailsPage", {
          driverId: selectedPicker.driverId,
          driverName: selectedPicker.driverName,
          originAddress: selectedPicker.origin.address,
          destinationAddress: selectedPicker.destination.address,
          rideId: responseData.ride_id,
        });
      }, 5000);
    } catch (error) {
      console.error("Ride request error:", error);

      setIsLoading(false);

      Alert.alert("Error", "Failed to request a ride.");
    }
  };

  // const handleConfirmRide = async () => {
  //   if (!selectedPicker) {
  //     Alert.alert("Select a driver", "Please select a driver.");
  //     return;
  //   }
  //  console.log("1")

  //   setIsLoading(true); // Show loading screen
  //   console.log("2")

  //   try {
  //     const response = await fetch(`${BASE_URL}/ride/request`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         driver_id: selectedPicker.driverId,
  //         pickup_location: originPlace,
  //         dropoff_location: destinationPlace,
  //         fare: 10.0, // Replace with a dynamic fare if needed
  //       }),
  //     });
  //     console.log("3")

  //     if (!response.ok) {
  //       throw new Error(`Failed to request ride: ${response.status}`);
  //     }
  //     console.log("4")

  //     const responseData = await response.json();
  //     console.log("5")
  //     setConfirmedRideId(responseData.ride_id); // Save the ride id to track
  //     console.log("6")
  //     checkRideStatus(responseData.ride_id); // Start polling for ride status
  //     console.log("7")
  //   } catch (error) {
  //     console.error("Ride request error:", error);
  //     setIsLoading(false);
  //     Alert.alert("Error", "Failed to request a ride.");
  //   }
  // };


  // const handleConfirmRide = async () => {
  //   if (!selectedPicker) {
  //     Alert.alert("Select a driver", "Please select a driver.");
  //     return;
  //   }
  
  //   setIsLoading(true); // Show loading screen
  
  //   try {
  //     const response = await fetch(`${BASE_URL}/ride/request`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         driver_id: selectedPicker.driverId,
  //         pickup_location: originPlace,
  //         dropoff_location: destinationPlace,
  //         fare: 10.0, // Replace with a dynamic fare if needed
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`Failed to request ride: ${response.status}`);
  //     }
  
  //     const responseData = await response.json();
  //     setConfirmedRideId(responseData.ride_id);
  
  //     // Start checking ride status
  //     checkRideStatus(responseData.ride_id);
  //   } catch (error) {
  //     console.error("Ride request error:", error);
  //     setIsLoading(false);
  //     Alert.alert("Error", "Failed to request a ride.");
  //   }
  // };
  

  //############### new

  // const checkRideStatus = async (rideId) => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(`${BASE_URL}/driver/rides?driver_id=${selectedPicker.driverId}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch ride status");
  //       }

  //       const data = await response.json();
  //       const ride = data.ride_requests.find((r) => r.id === rideId);

  //       if (ride && ride.request_to_ride === false) {
  //         clearInterval(interval); // Stop polling
  //         setIsLoading(false); // Hide loading screen
  //         navigation.navigate("PickerDetailsPage", {
  //           driverId: selectedPicker.driverId,
  //           driverName: selectedPicker.driverName,
  //           originAddress: selectedPicker.origin.address,
  //           destinationAddress: selectedPicker.destination.address,
  //           rideId: ride.id,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error checking ride status:", error);
  //     }
  //   }, 3000); // Poll every 3 seconds
  // };

  // const checkRideStatus = async (rideId) => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(`${BASE_URL}/driver/rides?driver_id=${selectedPicker.driverId}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch ride status");
  //       }

  //       const data = await response.json();
  //       const ride = data.ride_requests.find((r) => r.id === rideId);

  //       // If the ride is accepted or cancelled, stop polling and update UI accordingly
  //       if (ride && (ride.request_to_ride === false || ride.status === "accepted" || ride.status === "cancelled")) {
  //         clearInterval(interval); // Stop polling
  //         setIsLoading(false); // Hide loading screen
  //         if (ride.status === "accepted") {
  //           navigation.navigate("PickerDetailsPage", {
  //             driverId: selectedPicker.driverId,
  //             driverName: selectedPicker.driverName,
  //             originAddress: selectedPicker.origin.address,
  //             destinationAddress: selectedPicker.destination.address,
  //             rideId: ride.id,
  //           });
  //         } else if (ride.status === "cancelled") {
  //           Alert.alert("Ride Cancelled", "The driver has cancelled your ride request.");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking ride status:", error);
  //     }
  //   }, 3000); // Poll every 3 seconds
  // };

  // const checkRideStatus = async (rideId) => {
  //   // Perform an immediate check
  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/driver/rides?driver_id=${selectedPicker.driverId}`
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       const ride = data.ride_requests.find((r) => r.id === rideId);
  //       if (
  //         ride &&
  //         (ride.request_to_ride === false ||
  //           ride.status === "accepted" ||
  //           ride.status === "cancelled")
  //       ) {
  //         if (ride.status === "accepted") {
  //           setIsLoading(false);
  //           navigation.navigate("PickerDetailsPage", {
  //             driverId: selectedPicker.driverId,
  //             driverName: selectedPicker.driverName,
  //             originAddress: selectedPicker.origin.address,
  //             destinationAddress: selectedPicker.destination.address,
  //             rideId: ride.id,
  //           });
  //           return;
  //         } else if (ride.status === "cancelled") {
  //           setIsLoading(false);
  //           Alert.alert(
  //             "Ride Cancelled",
  //             "The driver has cancelled your ride request."
  //           );
  //           return;
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Immediate ride check error:", error);
  //   }

  //   // If immediate check didn't result in a status change, start polling every second
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(
  //         `${BASE_URL}/driver/rides?driver_id=${selectedPicker.driverId}`
  //       );
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch ride status");
  //       }
  //       const data = await response.json();
  //       const ride = data.ride_requests.find((r) => r.id === rideId);
  //       if (
  //         ride &&
  //         (ride.request_to_ride === false ||
  //           ride.status === "accepted" ||
  //           ride.status === "cancelled")
  //       ) {
  //         clearInterval(interval); // Stop polling
  //         setIsLoading(false); // Hide loading screen
  //         if (ride.status === "accepted") {
  //           navigation.navigate("PickerDetailsPage", {
  //             driverId: selectedPicker.driverId,
  //             driverName: selectedPicker.driverName,
  //             originAddress: selectedPicker.origin.address,
  //             destinationAddress: selectedPicker.destination.address,
  //             rideId: ride.id,
  //           });
  //         } else if (ride.status === "cancelled") {
  //           Alert.alert(
  //             "Ride Cancelled",
  //             "The driver has cancelled your ride request."
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking ride status:", error);
  //     }
  //   }, 1000); // Poll every 1 second
  // };
  // console.log("8")
  // const checkRideStatus = async (rideId) => {
  //   console.log("89")

  //   const interval = setInterval(async () => {
  //     console.log("10")

  //     try {
  //       console.log("11")
  //       const response = await fetch(`${BASE_URL}/driver/rides?driver_id=${selectedPicker.driverId}`);
  //       console.log("12")
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch ride status");
  //         console.log("13")
  //       }
  //       console.log("13 main")
  //       const data = await response.json();
  //       console.log("14")
  //       // Find the specific ride we're tracking
  //       const ride = data.ride_requests.find((r) => r.id === rideId);
  //       console.log("15")
  //       if (ride) {
  //         console.log("16")
  //         // Check if the ride has been accepted or cancelled
  //         if (ride.request_to_ride === false || ride.status === "accepted" || ride.status === "cancelled") {
  //           console.log("17")
  //           clearInterval(interval); // Stop polling
  //           console.log("18")
  //           setIsLoading(false); // Hide loading screen
  //           console.log("19")
  //           if (ride.status === "accepted") {
  //             console.log("20")
  //             navigation.navigate("PickerDetailsPage", {
  //               driverId: selectedPicker.driverId,
  //               driverName: selectedPicker.driverName,
  //               originAddress: selectedPicker.origin.address,
  //               destinationAddress: selectedPicker.destination.address,
  //               rideId: ride.id,
  //             });
  //             console.log("21")
  //           } else if (ride.status === "cancelled") {
  //             console.log("22")
  //             Alert.alert("Ride Cancelled", "The driver has cancelled your ride request.");
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log("23")
  //       console.error("Error checking ride status:", error);
  //     }
  //   }, 1000); // Poll every 1 second for near-real-time updates
  // };
  
  const checkRideStatus = async (rideId) => {
    console.log("Checking ride status...");
  
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${BASE_URL}/ride/status/${rideId}`);
        if (!response.ok) throw new Error("Failed to fetch ride status");
  
        const data = await response.json();
        console.log("Ride status:", data.status);
  
        if (data.status === "accepted") {
          clearInterval(interval); // Stop polling
          setIsLoading(false); // Hide loading screen
          navigation.navigate("PickerDetailsPage", {
            driverId: data.driver.id,
            driverName: data.driver.name,
            originAddress: data.origin.address,
            destinationAddress: data.destination.address,
          });
        }
      } catch (error) {
        console.error("Error checking ride status:", error);
      }
    }, 2000); // Poll every 2 seconds
  };
  

  
  //############### end

  const cleanAddress = (address) => {
    return address ? address.replace(/^[^,]+, /, "") : "Not Provided";
  };

  const handlePickerSelection = (index) => {
    setSelectedPicker(pickersRoute[index]); // Only one driver can be selected at a time
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardRider}>
          <Text style={styles.title}>Your Ride Details</Text>
          <Text style={styles.label}>🚀 Origin:</Text>
          <Text style={styles.value}>{cleanAddress(originPlace)}</Text>
          <Text style={styles.label}>📍 Destination:</Text>
          <Text style={styles.value}>{cleanAddress(destinationPlace)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Available Pickers</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : pickersRoute.length > 0 ? (
          pickersRoute.map((picker, index) => (
            <View key={index} style={styles.cardPicker}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerLabel}>
                  {picker.driverName || `Driver ${index + 1}`}
                </Text>
              </View>

              <View style={styles.pickerInfo}>
                <Text style={styles.label}>🚀 Origin:</Text>
                <Text style={styles.value}>
                  {cleanAddress(picker.origin.address)}
                </Text>
              </View>

              <View style={styles.pickerInfo}>
                <Text style={styles.label}>📍 Destination:</Text>
                <Text style={styles.value}>
                  {cleanAddress(picker.destination.address)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handlePickerSelection(index)}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedPicker?.driverId === picker.driverId &&
                      styles.checkboxSelected,
                  ]}
                />
                <Text style={styles.checkboxLabel}>Select this Driver</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No pickers available.</Text>
        )}
      </ScrollView>

      {selectedPicker && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmRide}
        >
          <Text style={styles.buttonText}>Confirm Your Ride</Text>
        </TouchableOpacity>
      )}
      {/* Beautiful Loading Screen */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              Waiting for response from the picker...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmYouRide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 80,
  },
  cardRider: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
    color: "#333",
    paddingVertical: 4,
  },
  confirmButton: {
    width: "90%",
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  cardPicker: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#6200ee",
  },
  pickerHeader: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: "flex-start",
    marginLeft: -10,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left",
  },
  pickerInfo: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#6200ee",
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: "#6200ee",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  confirmButton: {
    width: "90%",
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  // Loading Overlay Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#333",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  distanceContainer: {
    backgroundColor: "#EDE7F6", // Light purple background for contrast
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start", // Aligns the box to the left
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6200ee",
    textAlign: "left",
  },
});
