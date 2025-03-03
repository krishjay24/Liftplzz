import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/Entypo";
import Setting from "react-native-vector-icons/Ionicons";
import Logout from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../utils/apiConfig";
import { useNavigation } from "@react-navigation/native";

const DriverProfilePage = ({ route }) => {
  const navigation = useNavigation(); // Get navigation object

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/driver_logout`, {
        method: "POST",
        credentials: "include", // Include cookies/session data
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Logout failed! (${response.status})`);
      }

      const data = await response.json();
      alert(data.message); // Show success message
      navigation.navigate("NavigatingScreens"); // Redirect to Login screen
    } catch (error) {
      console.error("Logout error:", error.message); // Log the error message
      alert("Logout failed! Please try again.");
    }
  };

  return (
    <View>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.backgroundImage}
        />
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={require("../../assets/peterPrasad.png")}
            style={styles.profileImage}
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.petertext}>Driver Captain</Text>
        <Text style={styles.phonenumber}>9912456790</Text>
      </View>
      <View
        style={{
          marginTop: 30,
          // justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.walletContainer}>
          <View style={styles.topwalletBoxOne}>
            <Text style={styles.walletText}>Wallet</Text>
            <Text style={styles.rupeesText}>
              ₹ 20
              {/* {walletAmount} */}
            </Text>
          </View>
          <View style={styles.topwalletBoxTwo}>
            <Text style={styles.noofkmsText}>Number of KMS</Text>
            <Text style={styles.noofkms}>10</Text>
          </View>
        </View>

        <View style={styles.historyBox}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Icon2 name="back-in-time" size={20} style={styles.timeIcon} />
            <Text style={styles.navText}>History</Text>
          </View>
          <View>
            <Icon name="right" size={20} style={styles.iconLeft} />
          </View>
        </View>
        <View style={styles.historyBox}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Setting name="settings" size={20} style={styles.timeIcon} />
            <Text style={styles.navText}>Settings</Text>
          </View>
          <View>
            <Icon name="right" size={20} style={styles.iconLeft} />
          </View>
        </View>
        {/* <View style={styles.historyBox}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Logout name="logout" size={20} style={styles.timeIcon} />
            <Text style={styles.navText}>Logout</Text>
          </View>
          <View>
            <Icon name="right" size={20} style={styles.iconLeft} />
          </View>
        </View> */}
        <TouchableOpacity onPress={handleLogout} style={styles.historyBox}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Logout name="logout" size={20} style={styles.timeIcon} />
            <Text style={styles.navText}>Logout</Text>
          </View>
          <View>
            <Icon name="right" size={20} style={styles.iconLeft} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverProfilePage;

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    height: "40%",
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -75,
    alignSelf: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "white",
  },
  textContainer: {
    marginTop: 75,
    alignItems: "center",
  },
  petertext: {
    color: "#000",
    fontWeight: "900",
    fontSize: 40,
  },
  phonenumber: {
    color: "#000",
    fontWeight: "400",
    fontSize: 18,
  },
  walletContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  topwalletBoxOne: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "38%",
    height: 85,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
    marginRight: 7,
  },
  topwalletBoxTwo: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "38%",
    height: 85,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
    marginLeft: 7,
  },
  walletText: {
    color: "#000",
    fontWeight: "400",
    fontSize: 15,
  },
  noofkmsText: {
    color: "#000",
    fontWeight: "400",
    fontSize: 15,
  },
  rupeesText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 40,
  },
  noofkms: {
    color: "#000",
    fontWeight: "700",
    fontSize: 40,
  },
  historyBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "80%",
    height: 40,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
    marginTop: 13,
  },
  navText: {
    color: "#000",
    fontWeight: "400",
    fontSize: 14,
    marginLeft: 8,
  },
});
