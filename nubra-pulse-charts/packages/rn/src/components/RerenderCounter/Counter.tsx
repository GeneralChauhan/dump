import React, { useRef, useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const CounterComponent = () => {
  // 1. Initialize useRef. The value persists across renders.
  const renderCount = useRef(0);

  // Example state to trigger re-renders
  const [count, setCount] = useState(0);

  // 2. Increment the count on every render
  renderCount.current = renderCount.current + 1;

  // 3. Optional: Use useEffect to log the count to the console
  // This runs after the render has completed
  useEffect(() => {
    console.log(`Component rendered ${renderCount.current} times`);
  });

  return (
    <View style={styles.container}>
      {/* 4. Display the current render count */}
      <Text style={styles.counterText}>
        Component has re-rendered: {renderCount.current} times
      </Text>

      {/* Example UI to trigger updates */}
      <Text style={styles.stateText}>Current State Count: {count}</Text>
      <Button
        title="Increment State (Triggers Re-render)"
        onPress={() => setCount((prevCount) => prevCount + 1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  counterText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red", // Highlight the counter
  },
  stateText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default CounterComponent;
