"use client";
import { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  Psychology,
  DeleteOutline,
  SportsEsports,
  AccountBalance,
  PsychologyAlt,
  ShowChart,
  Timeline,
  TrendingFlat,
} from '@mui/icons-material';

interface RoundResult {
  round: number;
  player: boolean;
  banker: boolean;
  tie: boolean;
  timestamp: string;
}

interface BaccaratGrid {
  rows: number;
  cols: number;
  maxResults: number;
  mobileSize: {
    width: number;
    gap: number;
  };
}

export default function Home() {
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [message, setMessage] = useState<string>("");
  const [predictionStats, setPredictionStats] = useState({
    total: 0,
    playerPredictions: 0,
    bankerPredictions: 0,
    tiePredictions: 0,
    accuracy: 0
  });
  const [lastPrediction, setLastPrediction] = useState<'PLAYER' | 'BANKER' | 'TIE' | null>(null);

  const handleResultSubmit = async (winner: 'PLAYER' | 'BANKER' | 'TIE') => {
    const newResult = {
      round: currentRound,
      player: winner === "PLAYER",
      banker: winner === "BANKER",
      tie: winner === "TIE",
      timestamp: new Date().toLocaleTimeString(),
    };

    setResults([...results, newResult]);
    setCurrentRound((prev) => prev + 1);

    // 🔹 ตรวจสอบว่าทำนายถูกหรือไม่ และอัปเดตสถิติ
    if (lastPrediction) {
      setPredictionStats(prev => {
        const correctPrediction = lastPrediction === winner ? 1 : 0;
        const newTotal = prev.total + 1;
        const newCorrect = prev.accuracy * prev.total / 100 + correctPrediction;
        const newAccuracy = (newCorrect / newTotal) * 100;

        return {
          ...prev,
          total: newTotal,
          playerPredictions: prev.playerPredictions + (lastPrediction === "PLAYER" ? 1 : 0),
          bankerPredictions: prev.bankerPredictions + (lastPrediction === "BANKER" ? 1 : 0),
          tiePredictions: prev.tiePredictions + (lastPrediction === "TIE" ? 1 : 0),
          accuracy: Math.round(newAccuracy),
        };
      });
    }

    // ส่งผลลัพธ์ไปยังเซิร์ฟเวอร์
    try {
      await fetch("http://swmaxnet.com/submit-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: currentRound, winner }),
      });
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการส่งข้อมูล", error);
    }

    setLastPrediction(null);
  };

  const handleDeleteLastResult = () => {
    if (results.length > 0) {
      setResults(results.slice(0, -1));
      setCurrentRound(prev => prev - 1);
    }
  };

  const getStats = () => {
    const total = results.length;
    const playerWins = results.filter(r => r.player).length;
    const bankerWins = results.filter(r => r.banker).length;
    const ties = results.filter(r => r.tie).length;
    return {
      playerPercentage: total ? ((playerWins / total) * 100).toFixed(1) : '0',
      bankerPercentage: total ? ((bankerWins / total) * 100).toFixed(1) : '0',
      tiePercentage: total ? ((ties / total) * 100).toFixed(1) : '0',
      total,
      playerWins,
      bankerWins,
      ties
    };
  };

  const stats = getStats();

  const gridSize: BaccaratGrid = {
    rows: 6,
    cols: 13,
    maxResults: 78,
    mobileSize: {
      width: 5,
      gap: 0.5
    }
  };

  const renderBaccaratGrid = () => {
    const grid = [];

    for (let row = 0; row < gridSize.rows; row++) {
      const rowResults = [];
      for (let col = 0; col < gridSize.cols; col++) {
        const resultIndex = col * gridSize.rows + row;
        const result = results[resultIndex];

        rowResults.push(
          <Box
            key={`${row}-${col}`}
            className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center border border-gray-100"
          >
            {result && (
              <Box
                className={`
                  w-4 h-4 sm:w-6 sm:h-6 
                  rounded-full 
                  ${result.player ? 'bg-red-500' : result.banker ? 'bg-blue-500' : 'bg-green-500'} 
                  transition-colors
                `}
              />
            )}
          </Box>
        );
      }
      grid.push(
        <Box key={row} className="flex">
          {rowResults}
        </Box>
      );
    }
    return grid;
  };

  const isTableFull = results.length >= gridSize.maxResults;

  const checkWebsite = async () => {
    try {
      const response = await fetch("http://swmaxnet.com/predict");
      const data = await response.json();

      setMessage(`ผลการทำนาย: แนะนำให้เลือก ${data.prediction}`);
      setLastPrediction(data.prediction); // เก็บผลการทำนายไว้ แต่ไม่อัปเดตสถิติ
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเรียก API", error);
    }
  };


  const clearPredictionStats = () => {
    setPredictionStats({
      total: 0,
      playerPredictions: 0,
      bankerPredictions: 0,
      tiePredictions: 0,
      accuracy: 0
    });
    setMessage("");
  };

  const clearResults = () => {
    setResults([]);
    setCurrentRound(1);
    setPredictionStats({
      total: 0,
      playerPredictions: 0,
      bankerPredictions: 0,
      tiePredictions: 0,
      accuracy: 0
    });
    setMessage("");
  };

  return (
    <Box className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Container maxWidth="md" className="py-6 px-3">
        {/* Header */}
        <Box className="text-center mb-8 mx-auto space-y-6 max-w-2xl">
          <Box className="bg-white rounded-2xl px-6 py-3 shadow-md border border-blue-100 w-full">
            <Box className="flex flex-col gap-2">
              <Typography variant="h4" component="h1"
                className="text-blue-900 flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold">
                ระบบทำนายผลบาคาร่า
              </Typography>
              <Typography variant="subtitle1"
                className="text-blue-600 flex items-center justify-center gap-2 text-sm border-t border-blue-100 pt-2">
                <ShowChart className="text-blue-500" />
                วิเคราะห์ผลด้วยระบบ AI ล่าสุด
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box className="max-w-2xl mx-auto space-y-4">
          {/* Prediction Result */}
          <Box className="bg-white rounded-2xl p-6 shadow-md border border-blue-100 w-full">
            {/* Prediction Stats */}
            <Box className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl w-full">
              <Box className="flex justify-between items-center mb-6">
                <Typography variant="h6" className="text-blue-900 font-bold flex items-center gap-2 text-lg">
                  <Assessment className="text-blue-500 text-xl" />
                  สถิติการทำนาย
                </Typography>
                {predictionStats.total > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteOutline />}
                    className="border-2 border-red-400 text-red-500 hover:bg-red-50 text-sm px-4 py-1"
                    onClick={clearPredictionStats}
                  >
                    ล้างสถิติ
                  </Button>
                )}
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography className="text-2xl font-bold text-red-500">
                      {predictionStats.playerPredictions}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      ทำนาย PLAYER
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography className="text-2xl font-bold text-green-500">
                      {predictionStats.tiePredictions}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      ทำนาย TIE
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography className="text-2xl font-bold text-blue-500">
                      {predictionStats.bankerPredictions}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      ทำนาย BANKER
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box className="text-center">
                    <Typography className="text-2xl font-bold text-green-500">
                      {predictionStats.accuracy}%
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      ความแม่นยำ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box className="flex flex-col items-center gap-6 w-full">
              <Typography variant="h6" className="text-blue-900 font-bold flex items-center gap-2 text-xl">
                <PsychologyAlt className="text-blue-500 text-2xl" />
                การทำนายผลบาคาร่า
              </Typography>

              <Typography
                className="text-xl text-gray-700 text-center p-6 rounded-xl bg-blue-50 
                border-2 border-blue-100 min-h-[80px] flex items-center justify-center w-full"
              >
                {message || "กดปุ่มเพื่อดูผลการทำนาย"}
              </Typography>

              <Button
                variant="contained"
                size="large"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 
                hover:to-indigo-700 py-4 px-10 rounded-xl text-xl font-semibold shadow-lg 
                hover:shadow-xl transition-all duration-300 flex items-center gap-3 
                hover:scale-105 transform w-full sm:w-auto"
                onClick={checkWebsite}
              >
                <Psychology className="text-2xl" />
                ทำนายผล
              </Button>
            </Box>
          </Box>

          {/* Result Recorder */}
          <Box className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
            <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <Typography variant="h6" className="text-blue-900 font-bold flex items-center gap-2 text-lg">
                <Psychology className="text-blue-500" />
                บันทึกผลรอบที่ {currentRound}
              </Typography>
              <Box className="flex gap-2">
                {results.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<DeleteOutline />}
                    size="small"
                    className="border-2 border-red-400 text-red-500 hover:bg-red-50 
                    rounded-xl font-medium px-4 transition-colors"
                    onClick={handleDeleteLastResult}
                  >
                    ลบผลล่าสุด
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={clearResults}
                  size="small"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 text-sm sm:text-base"
                >
                  ล้างข้อมูล
                </Button>
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SportsEsports />}
                  className="py-3 text-base bg-red-500 hover:bg-red-600 shadow-md 
                  transition-all duration-200 rounded-xl"
                  onClick={() => handleResultSubmit('PLAYER')}
                  disabled={isTableFull}
                >
                  PLAYER
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  className="py-3 text-base bg-green-500 hover:bg-green-600 shadow-md 
                  transition-all duration-200 rounded-xl"
                  onClick={() => handleResultSubmit('TIE')}
                  disabled={isTableFull}
                >
                  TIE
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<AccountBalance />}
                  className="py-3 text-base bg-blue-500 hover:bg-blue-600 shadow-md 
                  transition-all duration-200 rounded-xl"
                  onClick={() => handleResultSubmit('BANKER')}
                  disabled={isTableFull}
                >
                  BANKER
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Baccarat Grid */}
          <Box className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
            <Box className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
              <Typography variant="h6" className="text-blue-900 font-bold text-lg">
                <Timeline className="text-blue-500 mr-2" />
                ตารางผลบาคาร่า
              </Typography>
              <Box className="flex gap-4">
                <Box className="flex items-center gap-2">
                  <Box className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                  <Typography className="text-sm text-gray-600">Player</Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <Box className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                  <Typography className="text-sm text-gray-600">Tie</Typography>
                </Box>
                <Box className="flex items-center gap-2">
                  <Box className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
                  <Typography className="text-sm text-gray-600">Banker</Typography>
                </Box>
              </Box>
            </Box>

            <Box className="flex justify-center">
              <Box className="overflow-x-auto">
                <Box className="border border-gray-100 rounded-xl p-4 w-fit mx-auto bg-gray-50">
                  <Box className="flex flex-col gap-1">
                    {renderBaccaratGrid()}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Stats Display */}
          <Box className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
            <Typography variant="h6" className="text-blue-900 font-bold mb-6 flex items-center gap-2 text-lg">
              <Assessment className="text-blue-500" />
              สถิติล่าสุด
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 rounded-xl bg-red-50 hover:bg-red-100 
                  transition-colors duration-200">
                  <TrendingUp className="text-red-500 text-3xl mb-2" />
                  <Typography className="text-3xl font-bold text-red-500 mb-1">
                    {stats.playerWins}
                  </Typography>
                  <Typography className="text-sm text-gray-600">
                    PLAYER ({stats.playerPercentage}%)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 rounded-xl bg-green-50 hover:bg-green-100 
                  transition-colors duration-200">
                  <TrendingFlat className="text-green-500 text-3xl mb-2" />
                  <Typography className="text-3xl font-bold text-green-500 mb-1">
                    {stats.ties}
                  </Typography>
                  <Typography className="text-sm text-gray-600">
                    TIE ({stats.tiePercentage}%)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 
                  transition-colors duration-200">
                  <TrendingDown className="text-blue-500 text-3xl mb-2" />
                  <Typography className="text-3xl font-bold text-blue-500 mb-1">
                    {stats.bankerWins}
                  </Typography>
                  <Typography className="text-sm text-gray-600">
                    BANKER ({stats.bankerPercentage}%)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Box>
      </Container>
    </Box>
  );
}