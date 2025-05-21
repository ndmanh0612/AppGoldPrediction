import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../@types";
import {
  LineChart,
  XAxis,
  YAxis,
  Grid as OriginalGrid,
  GridProps,
} from "react-native-svg-charts";
import * as shape from "d3-shape";
import * as scale from "d3-scale";
import moment from "moment";
import {
  getHistoricalData,
  getForecastData,
  getAllChartData,
  DataPoint,
} from "../services/chartData";

const screenHeight = Dimensions.get("window").height;
const popupHeight = screenHeight * 0.55;

const Grid: React.FC<GridProps<number>> = ({
  belowChart = false,
  direction = OriginalGrid.Direction.HORIZONTAL,
  ticks = [],
  svg = {},
  ...rest
}) => (
  <OriginalGrid belowChart={belowChart} direction={direction} ticks={ticks} svg={svg} {...rest} />
);

interface ChartViewProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const ChartView: React.FC<ChartViewProps> = ({
  visible,
  onClose,
  title = "CHART",
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // State quản lý xem màn hình nào:
  // "html" = Chart HTML webview mặc định
  // "predictChart" = chart dự đoán
  // "predictText" = text dự đoán
  const [viewMode, setViewMode] = useState<"html" | "predictChart" | "predictText">("html");

  // State menu dropdown của nút Predict Gold
  const [predictMenuVisible, setPredictMenuVisible] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? screenHeight - popupHeight : screenHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: visible ? 300 : 200,
        useNativeDriver: false,
      }),
    ]).start();

    if (!visible) {
      setPredictMenuVisible(false);
      setViewMode("html");
    }
  }, [visible]);

  // Dữ liệu
  const historicalData = useMemo<DataPoint[]>(getHistoricalData, []);
  const forecastData = useMemo<DataPoint[]>(getForecastData, []);
  const allData = useMemo<DataPoint[]>(getAllChartData, []);

  const startDate = moment("2022-01-01").valueOf();

  const filteredHistoricalData = useMemo(() => {
    return historicalData.filter((point) => point.x >= startDate);
  }, [historicalData]);

  const fullForecastData = forecastData;

  const xMax = useMemo(() => {
    if (fullForecastData.length === 0) return startDate;
    return fullForecastData.reduce(
      (max, point) => (point.x > max ? point.x : max),
      fullForecastData[0].x
    );
  }, [fullForecastData]);

  const { yMin, yMax } = useMemo(() => {
    const combined = [...filteredHistoricalData, ...fullForecastData];
    if (combined.length === 0) return { yMin: 0, yMax: 0 };
    let min = combined[0].y;
    let max = combined[0].y;
    combined.forEach((p) => {
      if (p.y < min) min = p.y;
      if (p.y > max) max = p.y;
    });
    return { yMin: min, yMax: max };
  }, [filteredHistoricalData, fullForecastData]);

  const filteredAllData = useMemo(() => {
    return allData.filter((point) => point.x >= startDate);
  }, [allData]);

  const numberOfTicks = 6;

  const tvHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 80%;
        background-color: #fff;
      }
      .tradingview-widget-container {
        height: 80%;
        width: 100%;
        padding-bottom: 12px;
        box-sizing: border-box;
      }
      .tradingview-widget-container__widget {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
      {
        "autosize": true,
        "symbol": "FOREXCOM:XAUUSD",
        "interval": "D",    
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }
      </script>
    </div>
  </body>
  </html>
`;

  // Chọn xem Chart HTML
  const onPressChartHtml = () => {
    setViewMode("html");
    setPredictMenuVisible(false);
  };

  // Bấm Predict Gold bật/tắt menu dropdown
  const onPressPredictGold = () => {
    setPredictMenuVisible((v) => !v);
  };

  // Chọn Chart Predict trong menu dropdown
  const onSelectPredictChart = () => {
    setViewMode("predictChart");
    setPredictMenuVisible(false);
  };

  // Chọn Text Predict trong menu dropdown
  const onSelectPredictText = () => {
    setViewMode("predictText");
    setPredictMenuVisible(false);
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        { top: slideAnim, opacity: opacityAnim, height: popupHeight },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.actions}>
          {/* Nút Chart HTML */}
          <TouchableOpacity
            style={[styles.button, viewMode === "html" && styles.active]}
            onPress={onPressChartHtml}
          >
            <Text style={styles.buttonText}>Chart RealTime</Text>
          </TouchableOpacity>

          {/* Nút Predict Gold với menu dropdown */}
          <View>
            <TouchableOpacity
              style={[styles.button, (viewMode === "predictChart" || viewMode === "predictText") && styles.active]}
              onPress={onPressPredictGold}
            >
              <Text style={styles.buttonText}>Predict Gold ▾</Text>
            </TouchableOpacity>

            {/* Menu dropdown */}
            {predictMenuVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={[styles.dropdownItem, viewMode === "predictChart" && styles.dropdownItemActive]}
                  onPress={onSelectPredictChart}
                >
                  <Text style={styles.dropdownText}>Chart Predict</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dropdownItem, viewMode === "predictText" && styles.dropdownItemActive]}
                  onPress={onSelectPredictText}
                >
                  <Text style={styles.dropdownText}>Text Predict</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {viewMode === "html" ? (
          <View style={styles.webContainer}>
            <WebView
              style={styles.webview}
              originWhitelist={["*"]}
              source={{ html: tvHtml }}
            />
          </View>
        ) : viewMode === "predictChart" ? (
          <View style={styles.container}>
            <YAxis
              style={{ marginRight: 8 }}
              data={[...filteredHistoricalData, ...fullForecastData]}
              contentInset={{ top: 20, bottom: 20 }}
              svg={{ fontSize: 10, fill: "grey" }}
              numberOfTicks={numberOfTicks}
              min={yMin}
              max={yMax}
            />
            <View style={{ flex: 1 }}>
              <LineChart
                style={{ flex: 1 }}
                data={filteredHistoricalData}
                xAccessor={({ item }) => item.x}
                yAccessor={({ item }) => item.y}
                xScale={scale.scaleTime}
                curve={shape.curveMonotoneX}
                svg={{ stroke: "black", strokeWidth: 1 }}
                contentInset={{ top: 20, bottom: 20 }}
                xMin={startDate}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
              >
                <Grid />
              </LineChart>
              <LineChart
                style={StyleSheet.absoluteFill}
                data={fullForecastData}
                xAccessor={({ item }) => item.x}
                yAccessor={({ item }) => item.y}
                xScale={scale.scaleTime}
                curve={shape.curveMonotoneX}
                svg={{ stroke: "red", strokeWidth: 2 }}
                contentInset={{ top: 20, bottom: 20 }}
                xMin={startDate}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
              />

              <XAxis
                style={{ marginHorizontal: -10, height: 30 }}
                data={filteredAllData}
                xAccessor={({ item }) => item.x}
                scale={scale.scaleTime}
                numberOfTicks={numberOfTicks}
                formatLabel={(value) => moment(value).format("YYYY")}
                svg={{ fontSize: 10, fill: "grey" }}
                contentInset={{ left: 10, right: 10 }}
              />
            </View>
          </View>
        ) : (
          // viewMode === "predictText"
          <View style={styles.predictTextContainer}>
            <Text style={styles.predictTextTitle}>Predicted GOLD Prices:</Text>
            <ScrollView style={styles.predictTextList}>
              {fullForecastData.map((point, index) => (
                <Text key={index} style={styles.predictTextItem}>
                  {moment(point.x).format("YYYY-MM-DD")}: {point.y.toFixed(2)}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
  },
  title: { flex: 1, fontSize: 16, fontWeight: "bold" },
  actions: { flexDirection: "row", alignItems: "center" },
  button: {
    backgroundColor: "#00899A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  active: { backgroundColor: "#005f65" },
  buttonText: { color: "#fff", fontSize: 12 },
  close: { fontSize: 18, color: "#888", marginLeft: 8 },
  body: { flex: 1 },
  webContainer: { flex: 1, marginBottom: 40 },
  webview: { flex: 1 },
  container: {
    height: "80%",
    flexDirection: "row",
    padding: 16,
    paddingBottom: 100,
  },
  predictTextContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  predictTextTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  predictTextList: {
    flexGrow: 0,
    maxHeight: popupHeight - 120, // Chừa chỗ header + padding
    marginBottom: 150,
  },
  predictTextItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#444",
  },
  dropdownMenu: {
    position: "absolute",
    top: 34,
    left: 0,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#00899A",
  },
  dropdownText: {
    fontSize: 14,
    color: "#000",
  },
});

export default ChartView;
