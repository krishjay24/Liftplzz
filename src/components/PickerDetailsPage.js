// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons"; // Import Ionicons

// const PickerDetailsPage = ({ route, navigation }) => {

//   const [isLoading, setIsLoading] = useState(false); // Loading state

//   // Extract correct parameters from route.params
//   const { driverId, driverName, originAddress, destinationAddress } =
//     route.params;

//   return (
//     <View style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Icon name="arrow-back" size={26} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Pickers Details</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.card}>
//           {/* Picker Information */}
//           <Text style={styles.name}>
//             🚗 Driver Name: {driverName || "Shyam"}
//           </Text>
//           <Text style={styles.label}>🆔 Driver ID: {driverId}</Text>

//           {/* Travel Details */}
//           <View style={styles.detailBox}>
//             <Text style={styles.label}>🚀 Origin:</Text>
//             <Text style={styles.value}>{originAddress}</Text>
//           </View>

//           <View style={styles.detailBox}>
//             <Text style={styles.label}>📍 Destination:</Text>
//             <Text style={styles.value}>{destinationAddress}</Text>
//           </View>

//           {/* Confirm Button */}
//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={() => {
//               navigation.navigate("TrackIndex");
//             }}
//           >
//             <Text style={styles.buttonText}>Track Picker</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Beautiful Loading Screen */}
//       <Modal visible={isLoading} transparent={true} animationType="fade">
//         <View style={styles.loadingOverlay}>
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={styles.loadingText}>
//               Waiting for response from the picker...
//             </Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//     marginTop: 30, // Added margin to prevent merging
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: "#6200ee",
//     elevation: 5,
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   backText: {
//     fontSize: 18,
//     color: "#fff",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   scrollContainer: {
//     padding: 20,
//     alignItems: "center",
//   },
//   card: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 25,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 6,
//     alignItems: "center",
//     marginTop: 10, // Added margin to separate from header
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: "#6200ee",
//   },
//   name: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 5,
//   },
//   phone: {
//     fontSize: 16,
//     color: "#555",
//     marginBottom: 15,
//   },
//   detailBox: {
//     width: "100%",
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     marginBottom: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//   },
//   label: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#6200ee",
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: "400",
//     color: "#333",
//     marginTop: 3,
//   },
//   confirmButton: {
//     marginTop: 15,
//     width: "100%",
//     backgroundColor: "#6200ee",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 4,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },

//   // Loading Overlay Styles
//   loadingOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingContainer: {
//     backgroundColor: "#333",
//     padding: 25,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   loadingText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     marginTop: 10,
//   },
//   distanceContainer: {
//     backgroundColor: "#EDE7F6", // Light purple background for contrast
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     marginTop: 10,
//     alignSelf: "flex-start", // Aligns the box to the left
//   },
//   distanceText: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#6200ee",
//     textAlign: "left",
//   },
// });

// export default PickerDetailsPage;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../utils/apiConfig";

const PickerDetailsPage = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [status, setStatus] = useState("pending");

  const { driverId, driverName, originAddress, destinationAddress, rideId } =
    route.params;

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(`${BASE_URL}/ride/status/${rideId}`);
  //       const data = await response.json();

  //       if (data.status === "accepted") {
  //         setIsLoading(false);
  //         clearInterval(interval); // Stop polling when ride is accepted
  //       }
  //     } catch (error) {
  //       console.error("Error fetching ride status:", error);
  //     }
  //   }, 3000); // Poll every 3 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, [rideId]);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(`${BASE_URL}/ride_status/${rideId}`);

  //       // Check if response is OK (status 200)
  //       if (!response.ok) {
  //         throw new Error(`HTTP Error! Status: ${response.status}`);
  //       }

  //       // Read response as text first
  //       const text = await response.text();
  //       console.log("Raw response:", text); // Debugging output

  //       // Ensure JSON before parsing
  //       if (
  //         response.headers.get("content-type")?.includes("application/json")
  //       ) {
  //         const data = JSON.parse(text);
  //         console.log("Parsed JSON:", data);

  //         if (data.status === "accepted") {
  //           setIsLoading(false);
  //           clearInterval(interval); // Stop polling when ride is accepted
  //         }
  //       } else {
  //         throw new Error("Invalid JSON response from server");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching ride status:", error);
  //     }
  //   }, 3000); // Poll every 3 seconds

  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, [rideId]);

  useEffect(() => {
    const fetchRideStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/ride_status/${rideId}`);

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed JSON:", data);

        if (data.status === "accepted") {
          setStatus("accepted");
          setIsLoading(false);
          clearInterval(interval); // Stop polling when ride is accepted
        }
      } catch (error) {
        console.error("Error fetching ride status:", error.message);
      }
    };

    const interval = setInterval(fetchRideStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [rideId]);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickers Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.name}>
            🚗 Driver Name: {driverName || "Shyam"}
          </Text>
          <Text style={styles.label}>🆔 Driver ID: {driverId}</Text>

          <View style={styles.detailBox}>
            <Text style={styles.label}>🚀 Origin:</Text>
            <Text style={styles.value}>{originAddress}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.label}>📍 Destination:</Text>
            <Text style={styles.value}>{destinationAddress}</Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate("TrackIndex")}
          >
            <Text style={styles.buttonText}>Track Picker</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <Text>Checking ride status...</Text>
        ) : (
          <Text>Ride Status: {status}</Text>
        )}
      </ScrollView>

      {/* Loading Modal */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", marginTop: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#6200ee",
    elevation: 5,
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#fff" },
  scrollContainer: { padding: 20, alignItems: "center" },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    alignItems: "center",
    marginTop: 10,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
  label: { fontSize: 17, fontWeight: "600", color: "#6200ee" },
  value: { fontSize: 16, fontWeight: "400", color: "#333", marginTop: 3 },
  confirmButton: {
    marginTop: 15,
    width: "100%",
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
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
});

export default PickerDetailsPage;
