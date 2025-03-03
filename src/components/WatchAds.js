import React, { useCallback, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YouTubeIframe from "react-native-youtube-iframe";
import Icon from "react-native-vector-icons/AntDesign";
import RBSheet from "react-native-raw-bottom-sheet";
import Videos from "./Videos";

const WatchAds = ({ navigation }) => {
  const bottomSheetRef = useRef();
  const playerRef = useRef(); // Ref for the YouTube player

  const [playing, setPlaying] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0); // Store video duration

  // Callback when video state changes
  const onStateChange = useCallback(
    (state) => {
      if (state === "ended") {
        setPlaying(false);
        // Add wallet amount based on video duration (rounded to the nearest minute)
        const durationInMinutes = Math.ceil(videoDuration / 60);
        setWalletAmount((prevAmount) => prevAmount + durationInMinutes);
      }
    },
    [videoDuration]
  );

  // Callback when player is ready
  const onPlayerReady = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.getDuration().then((duration) => {
        setVideoDuration(duration); // Save the video duration
      });
    }
  }, []);

  const togglePlaying = () => {
    setPlaying((prev) => !prev);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={{ padding: 15 }}>
          <View style={styles.WatchVideoContainer}>
            <View style={styles.iconLeftBox}>
              <Icon
                name="arrowleft"
                size={20}
                color="#6200ee"
                style={styles.iconLeft}
              />
            </View>
            <View style={styles.watchTextBox}>
              <Text style={styles.watchText}>Watch Videos</Text>
            </View>
          </View>

          <View style={styles.unlockfreeTextBox}>
            <Text style={styles.unlockfreeText}>Unlock Free Ride</Text>
          </View>

          {/* YouTube Iframe Player */}
          <View style={styles.container}>
            <YouTubeIframe
              ref={playerRef} // Reference the player
              height={204}
              width={"100%"}
              videoId={"Mvz7sS2-cic"} // Replace with your YouTube video ID
              play={playing}
              onReady={onPlayerReady} // Callback when the player is ready
              onChangeState={onStateChange}
            />
          </View>

          {/* Display Wallet Amount */}
          <View style={styles.walletAmountBox}>
            <Text style={styles.walletAmountText}>
              Wallet Amount: ₹{walletAmount}
            </Text>
          </View>

          {/* Wallet Button */}
          <View style={styles.walletButtonBox}>
            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => navigation.navigate("ProfilePage", { walletAmount })}
            >
              <Text style={styles.walletText}>Wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Watch More Videos Button */}
          <View style={styles.watchmoreBox}>
            <TouchableOpacity
              style={styles.watchmoreButton}
              onPress={() => bottomSheetRef.current.open()}
            >
              <Icon
                name="arrowdown"
                size={20}
                color="#fff"
                style={styles.iconDown}
              />
              <Text style={styles.watchmoreText}>WATCH MORE VIDEOS</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Sheet */}
          <RBSheet
            ref={bottomSheetRef}
            closeOnPressMask={true}
            draggable={true}
            // height={380} // Set height of the sheet
            height={715} // Set height of the sheet
            openDuration={250}
            customStyles={{
              container: {
                backgroundColor: "#eee",
              },
              wrapper: {
                backgroundColor: "transparent",
              },
            }}
          >
            <Videos />
          </RBSheet>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WatchAds;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 9,
    marginVertical: 10,
  },
  WatchVideoContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "red",
    borderWidth: 1,
    borderColor: "#6200ee",
    padding: 5,
    marginVertical: 10,
    borderRadius: 5,
  },
  iconLeftBox: {
    backgroundColor: "#fff",
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "#6200ee",
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  watchTextBox: {
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
  },
  watchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  unlockfreeTextBox: {},
  unlockfreeText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "400",
  },
  walletAmountBox: {
    marginVertical: 10,
    alignItems: "center",
  },
  walletAmountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ee",
  },
  walletButtonBox: {
    alignItems: "center",
  },
  walletButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "#6200ee",
    width: "60%",
    height: 60,
    justifyContent: "center",
  },
  walletText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "600",
    textAlign: "center",
  },
  watchmoreBox: {
    alignItems: "center",
  },
  watchmoreButton: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#6200ee",
    width: "80%",
    height: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  watchmoreText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginHorizontal: 5,
  },
});


