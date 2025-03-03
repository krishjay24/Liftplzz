import React, { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import YouTubeIframe from "react-native-youtube-iframe";

// Wallet component to display the total wallet amount
const Wallet = ({ walletAmount }) => {
  return (
    <View style={styles.walletContainer}>
      <Text style={styles.walletText}>Wallet Amount: ₹{walletAmount}</Text>
    </View>
  );
};

const Videos = () => {
  const videoIds = ["oE7WODudfjE", "YLslsZuEaNE", "xV9HnITo2C0"];
  const [walletAmount, setWalletAmount] = useState(0); // Wallet amount state

  const renderVideo = (videoId) => {
    const playerRef = useRef(); // Ref for the YouTube player
    const [playing, setPlaying] = useState(false);

    // Callback when video state changes
    const onStateChange = useCallback(
      (state) => {
        if (state === "ended") {
          setPlaying(false);
          setWalletAmount((prevAmount) => prevAmount + 1); // Increment wallet amount by ₹1
        }
      },
      []
    );

    return (
      <View key={videoId} style={styles.container}>
        <YouTubeIframe
          ref={playerRef} // Reference the player
          height={210}
          width={"100%"}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
        />
      </View>
    );
  };

  return (
    <ScrollView>
      {/* Pass wallet amount to the Wallet component */}
      <Wallet walletAmount={walletAmount} />
      <View style={{ padding: 10 }}>
        {videoIds.map((videoId) => renderVideo(videoId))}
      </View>
    </ScrollView>
  );
};

export default Videos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginVertical: 10,
  },
  walletContainer: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  walletText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

