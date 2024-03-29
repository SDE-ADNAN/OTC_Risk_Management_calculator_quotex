import AnimatedBG from "./components/Utility/AnimatedBG/AnimatedBG";
import "./App.scss";
import GoogleFontLoader from "react-google-font-loader";
import { useEffect, useRef, useState } from "react";
import FormContainer from "./components/Containers/FormContainer/FormContainer";
import TradesContainer from "./components/Containers/TradesContainer/TradesContainer";
import TradeItem from "./components/UIelements/TradeItem/TradeItem";
import percentages from "./constants/percentageVars";
import { AnimatePresence, usePresence } from "framer-motion";
import { gsap } from "gsap";
import { motion } from "framer-motion";

function App() {
  const [state, setState] = useState(null);
  const [startingInitialCap, setStartingInitialCap] = useState(null);
  const [show, setShow] = useState(true);
  const [formIsFilled, setFormIsFilled] = useState(false);
  const [trades, setTrades] = useState([]);
  const [mustScale, setMustScale] = useState(false);
  const [totProfit, setTotProfit] = useState(0);
  const [totLoss, setTotLoss] = useState(0);
  const ref = useRef(null);
  const [isPresent, safeToRemove] = usePresence();

  const setData = (key, val) => {
    setState((state) => ({ ...state, [`${key}`]: val }));
  };

  useEffect(()=>{
    if(trades.length>0){
      let totloss = 0;
      let totprofit = 0;
      trades.forEach((trade)=>{
        if(trade.loss && !trade.nill){
          totloss = totloss+trade.amount;
          setTotLoss(totloss)
        }
        if(!trade.loss && !trade.nill){
          totprofit = (totprofit + trade.returnAmount)-totloss
          setTotProfit(totprofit)
        }
      })
    }
  },[trades])

  // needs logical checks
  // useEffect(()=>{
  //   if(startingInitialCap){
  //     let risk1 = startingInitialCap*0.071;
  //     let risk2 = startingInitialCap*0.142;
  //     let risk3 = startingInitialCap*0.284;
  //     debugger
  //     if(startingInitialCap && (totLoss>= risk1)){
  //       alert("Your total loss has reached " + risk1.toFixed(2) + " for the day !!!");
  //     }else if(startingInitialCap && (totLoss>= risk2)){
  //       alert("Your total loss has reached " + risk2.toFixed(2) + " for the day !!!");
  //     }else if(startingInitialCap && (totLoss>= risk3)){
  //       alert("Your total loss has reached " + risk3.toFixed(2) + " for the day !!!");
  //     }
  //   }
  // },[totLoss])
  useEffect(() => {
    if (!isPresent) {
      gsap.to(ref.current, {
        opacity: 0,
        onComplete: () => safeToRemove?.(),
      });
    }
  }, [isPresent, safeToRemove]);

  useEffect(() => {
    const firstFeild = document.getElementById("initialCap");
    if (firstFeild) {
      firstFeild.focus();
    }
  }, []);
  useEffect(() => {
    if (mustScale) {
      setTimeout(() => {
        setMustScale(false);
      }, 150);
    }
  }, [mustScale]);
  useEffect(() => {
    let IC = state?.initialCap || null;
    let perReturn = state?.perReturn || null;
    let perRisk = state?.perRisk || null;
    let capSL = state?.capSL || null;

    if (IC && perReturn && perRisk && capSL) {
      let IC = state.initialCap;
      let tradeAmount = IC * percentages.profitPer;

      setFormIsFilled(true);
      if (trades.length === 0) {
        setTrades((prevState) => [
          ...prevState,
          {
            amount: tradeAmount,
            returnAmount: 0,
            loss: false,
            nill: true,
          },
        ]);
      }
    }
  }, [state, trades.length]);

  const markLoss = (index) => {
    let tradesState1 = [...trades];
    let tradesState2 = [...JSON.parse(JSON.stringify(tradesState1))];
    tradesState2[index].loss = true;
    tradesState2[index].nill = false;
    let finalTradeState = [...JSON.parse(JSON.stringify(tradesState2))];

    let lastTrade = finalTradeState[finalTradeState.length - 1];
    lastTrade.returnAmount = lastTrade.amount;
    let newTrade = {
      amount: lastTrade.amount * percentages.lossPer,
      return: 0,
      loss: false,
      nill: true,
    };
    finalTradeState.push(newTrade);

    state.initialCap = state.initialCap - lastTrade.amount;

    setTrades([...finalTradeState]);
  };

  const markProfit = (index) => {
    let tradesState1 = trades;
    let tradesState2 = [...JSON.parse(JSON.stringify(tradesState1))];
    tradesState2[index].loss = false;
    tradesState2[index].nill = false;
    let finalTradeState = [...JSON.parse(JSON.stringify(tradesState2))];

    let lastTrade = finalTradeState[finalTradeState.length - 1];
    lastTrade.returnAmount =
      lastTrade.amount *
      (state.perReturn > 1 ? state.perReturn / 100 : state.perReturn);

    state.initialCap = state.initialCap + lastTrade.returnAmount;
    let IC = state?.initialCap || null;
    let tradeAmount = IC * (percentages.profitPer + 1);
    let newTrade = {
      amount: tradeAmount * percentages.profitPer,
      return: 0,
      loss: false,
      nill: true,
    };
    finalTradeState.push(newTrade);

    setTrades([...finalTradeState]);
  };

 const getKValue=(num)=>{
  if(+num<1000){
    return num.toFixed(2);
  }
  if(+num>=1000){
    return (num/1000).toFixed(2)
  }
 }
  return (
    <>
      <GoogleFontLoader
        fonts={[
          {
            font: "Signika",
            weights: [300, 400, 500, 600],
          },
        ]}
        subsets={["cyrillic-ext", "greek"]}
      />
      <div className="bg">
        <AnimatedBG />
      </div>
      <div className="__container ">
        <AnimatePresence>
          {show ? (
            <FormContainer
              ref={ref}
              key="1234"
              setData={setData}
              setState={setState}
              state={state}
              setShow={setShow}
              show={show}
              setStartingInitialCap={setStartingInitialCap}
              exit={{y:"50%",opacity:0,transition:{duration:"5s",ease:"easeOut"}}}
            />
          ) : null}
        </AnimatePresence>
        {formIsFilled && trades.length > 0 && (
          <div className="headContainer">
            <motion.div
              className="Cap_head"
              animate={{ scale: mustScale ? 1.5 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 100 }}
            >
              {getKValue(totProfit)}{totProfit>1000&&"K"}
            </motion.div>
            <motion.div
              className="Cap_head"
              animate={{ scale: mustScale ? 1.5 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 100 }}
            >
              {getKValue(state?.initialCap)}{state?.initialCap>1000&&"K"}
            </motion.div>
            <motion.div
              className="Cap_head"
              animate={{ scale: mustScale ? 1.5 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 100 }}
            >
              {getKValue(totLoss)}{totLoss>1000&&"K"}
            </motion.div>
          </div>
        )}
        {formIsFilled && trades.length > 0 && (
          <TradesContainer>
            {trades.map((trade, index) => {
              return (
                <TradeItem
                  key={index}
                  trade={trade}
                  index={index}
                  markLoss={markLoss}
                  markProfit={markProfit}
                  setMustScale={setMustScale}
                  getKValue={getKValue}
                />
              );
            })}
          </TradesContainer>
        )}
      </div>
    </>
  );
}

export default App;
