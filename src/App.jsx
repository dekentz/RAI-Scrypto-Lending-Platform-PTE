import React, {useState, useEffect} from 'react';
import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import {getAccountAddress, signTransaction} from 'pte-browser-extension-sdk';
import useLocalStorageState from 'use-local-storage-state';
import './App.css';

const App = () => {
  const [accountAddress, setAccountAddress] = useLocalStorageState('account-address');
  
  const [oraclePackageAddress, setOraclePackageAddress] = useLocalStorageState('oracle-package-address');
  const [oracleComponentAddress, setOracleComponentAddress] = useLocalStorageState('oracle-component-address');
  const [oracleSetPriceInput, setOracleSetPriceInput] = useState(0.10);
  const [oracleSetPriceLogs, setOracleSetPriceLogs] = useState("");
  
  const [packageAddress, setPackageAddress] = useLocalStorageState('package-address');
  const [componentAddress, setComponentAddress] = useLocalStorageState('component-address');
  const [componentOracleAddressInput, setComponentOracleAddressInput] = useState("");
  const [adminResource, setAdminResource] = useLocalStorageState('admin-resource');
  const [positionResource, setPositionResource] = useLocalStorageState('position-resource');
  const [raiResource, setRaiResource] = useLocalStorageState('rai-resource');
  const [openPositionLogs, setOpenPositionLogs] = useState("");
  const [drawLogs, setDrawLogs] = useState("");
  const [closePositionLogs, setClosePositionLogs] = useState("");
  const [closePositionWithPaymentLogs, setClosePositionWithPaymentLogs] = useState("");
  const [paydownLogs, setPaydownLogs] = useState("");
  const [addCollateralLogs, setAddCollateralLogs] = useState("");
  const [partialWithdrawCollateralLogs, setPartialWithdrawCollateralLogs] = useState("");
  const [liquidateLogs, setLiquidateLogs] = useState("");
  const [checkProtocolSolvencyLogs, setCheckProtocolSolvencyLogs] = useState("");
  const [printAllPositionsLogs, setPrintAllPositionsLogs] = useState("");
  const [allLogs, setAllLogs] = useState([]);
  const [accountComponent, setAccountComponent] = useState("");
  const [ownedXrd, setOwnedXrd] = useState("");
  const [ownedPositions, setOwnedPositions] = useState([]);
  const [ownedRai, setOwnedRai] = useState("");
  const [openPositionInput, setOpenPositionInput] = useState(500);
  const [drawPositionInput, setDrawPositionInput] = useState("0000000000000000");
  const [drawRaiInput, setDrawRaiInput] = useState(25);
  const [paydownPositionInput, setPaydownPositionInput] = useState("0000000000000000");
  const [paydownRaiInput, setPaydownRaiInput] = useState(25);
  const [closePositionPositionInput, setClosePositionPositionInput] = useState("0000000000000000");
  const [closePositionWithPaymentPositionInput, setClosePositionWithPaymentPositionInput] = useState("0000000000000000");
  const [closePositionWithPaymentRaiInput, setClosePositionWithPaymentRaiInput] = useState(25);
  const [addCollateralPositionInput, setAddCollateralPositionInput] = useState("0000000000000000");
  const [addCollateralXrdInput, setAddCollateralXrdInput] = useState(20);
  const [partialWithdrawCollateralPositionInput, setPartialWithdrawCollateralPositionInput] = useState("0000000000000000");
  const [partialWithdrawCollateralXrdInput, setPartialWithdrawCollateralXrdInput] = useState(20);
  const [liquidatePositionInput, setLiquidatePositionInput] = useState("0000000000000000");
  const [liquidateRaiInput, setLiquidateRaiInput] = useState(50);
  const [redeemRaiInput, setRedeemRaiInput] = useState("");
  const [redeemLogs, setRedeemLogs] = useState("");
  const [updateInterestRateLogs, setUpdateInterestRateLogs] = useState("");
  const [updateInterestRateInput, setUpdateInterestRateInput] = useState(0.05);

  useEffect(() => {
    if (oracleComponentAddress) {
      setComponentOracleAddressInput(oracleComponentAddress);
    }
  }, [oracleComponentAddress])

  const loadAccountAddress = async () => {
    console.log("Getting account address");
    const addr = await getAccountAddress();
    setAccountAddress(addr);
  };
  
  const publishOraclePackage = async () => {
    // load wasm
    const response = await fetch('./oracle_placeholder.wasm');
    const wasm = new Uint8Array(await response.arrayBuffer());
    // construct manifest
    const manifest = new ManifestBuilder()
      .publishPackage(wasm)
      .build()
      .toString();
    // send to extension for signing
    const receipt = await signTransaction(manifest);
    // update UI
    console.log(receipt);
    setOraclePackageAddress(receipt.newPackages[0]);
  }
  
  const instantiateOracleComponent = async () => {
    // construct manifest
    const manifest = new ManifestBuilder()
      .callFunction(oraclePackageAddress, 'OraclePlaceholder', 'new', [])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();
    
    // send manifest to extension for signing
    const receipt = await signTransaction(manifest);

    // update UI
    console.log(receipt);
    if (receipt.status === "Success") {
      setOracleComponentAddress(receipt.newComponents[0]);
      setComponentOracleAddressInput(receipt.newComponents[0]);
    } else {
      setOracleComponentAddress("error");
    }
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const oracleSetPrice = async () => {
    // construct manifest
    const manifest = new ManifestBuilder()
      .callMethod(oracleComponentAddress, 'set_price', [
        `Decimal("${oracleSetPriceInput}")`
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();
    
    // send manifest to extension for signing
    const receipt = await signTransaction(manifest);

    // update UI
    console.log(receipt);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }

  const publishPackage = async () => {
    // load wasm
    const response = await fetch('./rai_test.wasm');
    const wasm = new Uint8Array(await response.arrayBuffer());
    // construct manifest
    const manifest = new ManifestBuilder()
      .publishPackage(wasm)
      .build()
      .toString();
    // send to extension for signing
    const receipt = await signTransaction(manifest);
    // update UI
    console.log(receipt);
    setPackageAddress(receipt.newPackages[0]);
  }

  const instantiateComponent = async () => {
    // construct manifest
    const manifest = new ManifestBuilder()
      .callFunction(packageAddress, 'RaiTest', 'new', [
        `ComponentAddress("${componentOracleAddressInput}")`
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();
    
    // send manifest to extension for signing
    const receipt = await signTransaction(manifest);

    // update UI
    console.log(receipt);
    if (receipt.status === "Success") {
      setComponentAddress(receipt.newComponents[0]);
      setAdminResource(receipt.newResources[0])
      setPositionResource(receipt.newResources[2]);
      setRaiResource(receipt.newResources[3]);
    } else {
      setComponentAddress("error");
    }
  }

  const openPosition = async () => {
    const manifest = new ManifestBuilder()
      .withdrawFromAccountByAmount(accountAddress, openPositionInput, '030000000000000000000000000000000000000000000000000004')
      .takeFromWorktop('030000000000000000000000000000000000000000000000000004', 'xrd')
      .callMethod(componentAddress, 'open_position', ['Bucket("xrd")'])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("openPosition logs:");
    console.log(receipt);
    setOpenPositionLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
    // TODO Display new position to position display array
  }
  
  const draw = async () => {
    const manifest = new ManifestBuilder()
      .createProofFromAccountByIds(accountAddress, [drawPositionInput], positionResource)
      .popFromAuthZone("positionBadge")
      .callMethod(componentAddress, 'draw', [
        'Proof("positionBadge")',
        // 'Decimal("5")'
        `Decimal("${drawRaiInput}")`
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("draw receipt:");
    console.log(receipt);
    
    setDrawLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const paydown = async () => {
    const manifest = new ManifestBuilder()
      .createProofFromAccountByIds(accountAddress, [paydownPositionInput], positionResource)
      .popFromAuthZone("positionBadge")
      .withdrawFromAccountByAmount(accountAddress, paydownRaiInput, raiResource)
      .takeFromWorktop(raiResource, 'rai')
      .callMethod(componentAddress, 'paydown', [
        'Proof("positionBadge")',
        'Bucket("rai")'
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("paydown receipt:");
    console.log(receipt);
    
    setPaydownLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }

  const closePositionWithPayment = async () => {
    const manifest = new ManifestBuilder()
      .withdrawFromAccountByIds(accountAddress, [closePositionWithPaymentPositionInput], positionResource)
      .takeFromWorktop(positionResource, 'positionBadge')
      .withdrawFromAccount(accountAddress, raiResource)
      .takeFromWorktop(raiResource, 'rai')
      .callMethod(componentAddress, 'close_position_with_payment', [
        'Bucket("positionBadge")',
        'Bucket("rai")'
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("close position with payment receipt:");
    console.log(receipt);
    setClosePositionWithPaymentLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const closePosition = async () => {
    const manifest = new ManifestBuilder()
      .withdrawFromAccountByIds(accountAddress, ['0000000000000000'], positionResource)
      .takeFromWorktop(positionResource, 'positionBadge')
      .callMethod(componentAddress, 'close_position', [
        'Bucket("positionBadge")',
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("close position receipt:");
    console.log(receipt);
    setClosePositionLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }


  const addCollateral = async () => {
    const manifest = new ManifestBuilder()
      .createProofFromAccountByIds(accountAddress, [addCollateralPositionInput], positionResource)
      .popFromAuthZone("positionBadge")
      .withdrawFromAccountByAmount(accountAddress, addCollateralXrdInput, '030000000000000000000000000000000000000000000000000004')
      .takeFromWorktop('030000000000000000000000000000000000000000000000000004', 'xrd')
      .callMethod(componentAddress, 'add_collateral', [
        'Proof("positionBadge")',
        'Bucket("xrd")'
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("add collateral receipt:");
    console.log(receipt);
    setAddCollateralLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }

  const partialWithdrawCollateral = async () => {
    const manifest = new ManifestBuilder()
      .createProofFromAccountByIds(accountAddress, [partialWithdrawCollateralPositionInput], positionResource)
      .popFromAuthZone("positionBadge")
      .callMethod(componentAddress, 'partial_withdraw_collateral', [
        'Proof("positionBadge")',
        // 'Decimal("400")'
        `Decimal("${partialWithdrawCollateralXrdInput}")`
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("partial withdraw collateral receipt:");
    console.log(receipt);
    setPartialWithdrawCollateralLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const liquidate = async () => {
    const manifest = new ManifestBuilder()
      .withdrawFromAccountByAmount(accountAddress, liquidateRaiInput, raiResource)
      .takeFromWorktop(raiResource, 'rai')
      .callMethod(componentAddress, 'liquidate', [
        `NonFungibleId("${liquidatePositionInput}")`,
        'Bucket("rai")'
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("liquidate receipt:");
    console.log(receipt);
    
    setLiquidateLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const checkProtocolSolvency = async () => {
    const manifest = new ManifestBuilder()
      .callMethod(componentAddress, 'check_protocol_solvency', [])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("checkProtocolSolvency receipt:");
    console.log(receipt);
    
    setCheckProtocolSolvencyLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const redeem = async () => {
    const manifest = new ManifestBuilder()
      .withdrawFromAccountByAmount(accountAddress, redeemRaiInput, raiResource)
      .takeFromWorktop(raiResource, 'rai')
      .callMethod(componentAddress, 'redeem', [
        'Bucket("rai")'
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("redeem receipt:");
    console.log(receipt);
    
    setRedeemLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const printAllPositions = async () => {
    const manifest = new ManifestBuilder()
      .callMethod(componentAddress, 'print_all_positions', [ ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("printAllPositions receipt:");
    console.log(receipt);
    
    setPrintAllPositionsLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }
  
  const updateInterestRate = async () => {
    const manifest = new ManifestBuilder()
      .createProofFromAccount(accountAddress, adminResource)
      .callMethod(componentAddress, 'update_interest_rate', [
        `Decimal("${updateInterestRateInput}")`
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);

    // Update UI
    console.log("updateInterestRate receipt:");
    console.log(receipt);
    
    setUpdateInterestRateLogs(receipt.logs);
    setAllLogs([...allLogs, "-", ...receipt.logs])
  }

  const updateAccountComponent = async () => {
    const api = new DefaultApi();
    const component = await api.getComponent({
      address: accountAddress
    });

    console.log(component);
    setAccountComponent(component);
    const xrd = component.ownedResources
        .filter(e => e.resourceAddress == "030000000000000000000000000000000000000000000000000004")[0]
    console.log(xrd);
    console.log("owned xrd: " + xrd.amount)
    setOwnedXrd(xrd.amount);
    if (raiResource) {
      const rai = component.ownedResources
          .filter(e => e.resourceAddress == raiResource)
      console.log(rai);
      if (rai?.length) {
        console.log("owned RAI: " + rai[0].amount)
        setOwnedRai(rai[0].amount);
      }
    }
    if (positionResource) {
      const position = component.ownedResources
          .filter(e => e.resourceAddress == positionResource)
      console.log(position);
      if (position?.length) {
        console.log(position[0].nonFungibleIds);
        setOwnedPositions(position[0].nonFungibleIds);
      }
    }
  }

  const displayOwnedPositions = () => {
    return <span className="mh2">{ownedPositions?.map(pos => <span className="mh2">{pos}</span>)}</span>
  }

  const displayAccountComponent = () => {
    if (!raiResource || !positionResource) {
      return;
    }
  }
  
  const displayTxLogs = (txLogArray) => {
    return <div>{txLogArray.map(log => <div>{log}</div>)}</div>
  }

  const displayAllLogs = () => {
    return <div>{allLogs.map(log => <div>{log}</div>)}</div>
  }

  // TODO publish and instantiate oracle, set price
  // TODO check_protocol_solvency and redeem
  
  return (
    <div className="mh2 mv2">
      <h1> RAI Lending Platform PTE Front End</h1>
      <div>
        <button onClick={loadAccountAddress}>Get Account Address</button>
        <span className="ml2">{accountAddress}</span>
      </div>
      <div className="mv2 pt4">
        <button onClick={publishOraclePackage}>Publish Oracle Placeholder Blueprint</button>
        <span className="ml2">{oraclePackageAddress ? "Oracle Package Address: " + oraclePackageAddress : ""}</span>
      </div>
      <div className="mv2">
        <button onClick={instantiateOracleComponent}>Instantiate Oracle Placeholder Component</button>
        <span className="ml2">{oracleComponentAddress ? "Oracle Component Address: " + oracleComponentAddress : ""}</span>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={oracleSetPrice}>Oracle Set Price</button>
          <div className="ml2"> Enter xrd_price: </div>
          <input className="mh2" value={oracleSetPriceInput} onChange={(e) => setOracleSetPriceInput(e.target.value)}></input>
        </div>
        <div className="ml2">{oracleSetPriceLogs ? "Logs: " + oracleSetPriceLogs : ""}</div>
      </div>
      <div className="mv2 pt4">
        <button onClick={publishPackage}>Publish RAI Lending Platform Blueprint</button>
        <span className="ml2">{packageAddress ? "Package Address: " + packageAddress : ""}</span>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={instantiateComponent}>Instantiate RAI Lending Platform Component</button>
          <div className="ml2"> Enter Oracle Component Address: </div>
          <input className="mh2" size="54" value={componentOracleAddressInput} onChange={(e) => setComponentOracleAddressInput(e.target.value)}></input>
        </div>
        <div className="ml2">{componentAddress ? "Component Address: " + componentAddress : ""}</div>
        <div className="ml2">{adminResource ? "Admin Badge Resource Address: " + adminResource : ""}</div>
        <div className="ml2">{positionResource ? "Position Badge Resource Address: " + positionResource : ""}</div>
        <div className="ml2">{raiResource ? "RAI Resource Address: " + raiResource : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={openPosition}>Open New Position</button>
          <div className="ml2"> Enter collateral XRD amount to lock for new position: </div>
          <input className="mh2" value={openPositionInput} onChange={(e) => setOpenPositionInput(e.target.value)}></input>
        </div>
        <div className="ml2">{openPositionLogs ? displayTxLogs(openPositionLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={draw}>Draw</button>
          <div className="ml2"> Enter Position ID </div>
          <input className="mh2" value={drawPositionInput} onChange={(e) => setDrawPositionInput(e.target.value)}></input>
          <div className="ml2"> Requested RAI to mint </div>
          <input className="mh2" value={drawRaiInput} onChange={(e) => setDrawRaiInput(e.target.value)}></input>
        </div>
        <div className="ml2">{drawLogs ? displayTxLogs(drawLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={paydown}>Paydown</button>
          <div className="ml2"> Enter Position ID </div>
          <input className="mh2" value={paydownPositionInput} onChange={(e) => setPaydownPositionInput(e.target.value)}></input>
          <div className="ml2"> RAI amount to paydown </div>
          <input className="mh2" value={paydownRaiInput} onChange={(e) => setPaydownRaiInput(e.target.value)}></input>
        </div>
        <div className="ml2">{paydownLogs ? displayTxLogs(paydownLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={closePositionWithPayment}>Close Position With Payment and withdraw collateral</button>
          <div className="ml2"> Enter Position Id </div>
          <input className="mh2" value={closePositionWithPaymentPositionInput} onChange={(e) => setClosePositionWithPaymentPositionInput(e.target.value)}></input>
        </div>
        <div className="ml2">{closePositionWithPaymentLogs ? displayTxLogs(closePositionWithPaymentLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={addCollateral}>Add Collateral</button>
          <div className="ml2"> Enter Position Id </div>
          <input className="mh2" value={addCollateralPositionInput} onChange={(e) => setAddCollateralPositionInput(e.target.value)}></input>
          <div className="ml2"> Additional collateral XRD amount </div>
          <input className="mh2" value={addCollateralXrdInput} onChange={(e) => setAddCollateralXrdInput(e.target.value)}></input>
        </div>
        <div className="ml2">{addCollateralLogs ? displayTxLogs(addCollateralLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={partialWithdrawCollateral}>Partial Withdraw Collateral</button>
          <div className="ml2"> Enter Position Id </div>
          <input className="mh2" value={partialWithdrawCollateralPositionInput} onChange={(e) => setAddCollateralPositionInput(e.target.value)}></input>
          <div className="ml2"> Withdraw collateral XRD amount </div>
          <input className="mh2" value={partialWithdrawCollateralXrdInput} onChange={(e) => setAddCollateralXrdInput(e.target.value)}></input>
        </div>
        <div className="ml2">{partialWithdrawCollateralLogs ? displayTxLogs(partialWithdrawCollateralLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={liquidate}>Liquidate</button>
          <div className="ml2"> Enter Position ID </div>
          <input className="mh2" value={liquidatePositionInput} onChange={(e) => setLiquidatePositionInput(e.target.value)}></input>
          <div className="ml2"> RAI amount to pay for liquidate </div>
          <input className="mh2" value={liquidateRaiInput} onChange={(e) => setLiquidateRaiInput(e.target.value)}></input>
        </div>
        <div className="ml2">{liquidateLogs ? displayTxLogs(liquidateLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={checkProtocolSolvency}>Check Protocol Solvency</button>
        </div>
        <div className="ml2">{checkProtocolSolvencyLogs ? displayTxLogs(checkProtocolSolvencyLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={redeem}>Redeem RAI</button>
          <div className="ml2"> When protocol insolvent, enter RAI amount to redeem for corresponding share of collateral pool: </div>
          <input className="mh2" value={redeemRaiInput} onChange={(e) => setRedeemRaiInput(e.target.value)}></input>
        </div>
        <div className="ml2">{redeemLogs ? displayTxLogs(redeemLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={printAllPositions}>Print All Positions</button>
          <span className="mh2">Print all outstanding positions to manually examine any for liquidation</span>
        </div>
        <div className="ml2">{printAllPositionsLogs ? displayTxLogs(printAllPositionsLogs) : ""}</div>
      </div>
      <div className="mv2">
        <div className="flex items-center">
          <button onClick={updateInterestRate}>Update Interest Rate</button>
          <div className="ml2"> Enter new interest rate (locked to admin only) </div>
          <input className="mh2" value={updateInterestRateInput} onChange={(e) => setUpdateInterestRateInput(e.target.value)}></input>
        </div>
        <div className="ml2">{updateInterestRateLogs ? displayTxLogs(updateInterestRateLogs) : ""}</div>
      </div>
      <div className="mt4">
        <button onClick={updateAccountComponent}>Fetch Account Component Resources</button>
        <div className="ml2">XRD: {ownedXrd}</div>
        <div className="ml2">RAI: {ownedRai}</div>
        <div className="ml2">Positions IDs: {displayOwnedPositions()}</div  >
      </div>

      <div className="mt2">
        <div>All Logs:</div>
        {displayAllLogs()}
      </div>
    </div>
  );
}

export default App;