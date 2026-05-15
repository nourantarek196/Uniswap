// ملاحظة: استبدل هذا العنوان بالعنوان الحقيقي من زميلك الخامس
const DEX_ADDRESS = "0x0000000000000000000000000000000000000000"; 

const DEX_ABI = [
    "function addLiquidity(uint256 amountA, uint256 amountB) external",
    "function swapAforB(uint256 amountAIn) external",
    "function swapBforA(uint256 amountBIn) external",
    "function getAmountOut(uint256 amountIn, uint256 resIn, uint256 resOut) public pure returns (uint256)",
    "function reserveA() public view returns (uint256)",
    "function reserveB() public view returns (uint256)"
];

let provider, signer, dexContract;

// 1. ربط المحفظة
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
            
            document.getElementById('accountAddress').innerText = accounts[0];
            document.getElementById('walletInfo').style.display = "block";
            document.getElementById('connectWalletBtn').innerText = "متصل ✅";
            showStatus("تم ربط المحفظة بنجاح", "success");
        } catch (e) {
            showStatus("خطأ في الربط بالمحفظة", "error");
        }
    } else {
        alert("يرجى تثبيت محفظة MetaMask!");
    }
}

// 2. حساب السعر التقديري بناءً على احتياطيات العقد (Reserves)
async function updateEstimatedPrice() {
    const val = document.getElementById('swapAmountIn').value;
    if (!val || !dexContract) return;

    try {
        const resA = await dexContract.reserveA(); [cite: 1, 2]
        const resB = await dexContract.reserveB(); [cite: 1, 2]
        const amountInWei = ethers.utils.parseEther(val);
        let out;

        // تحديد اتجاه التبادل بناءً على اختيار المستخدم
        if (document.getElementById('tokenInSelect').value === "TokenA") {
            out = await dexContract.getAmountOut(amountInWei, resA, resB); [cite: 7, 10]
        } else {
            out = await dexContract.getAmountOut(amountInWei, resB, resA); [cite: 7, 13]
        }
        document.getElementById('swapAmountOut').value = ethers.utils.formatEther(out);
    } catch (e) {
        console.log("السيولة غير كافية لحساب السعر حالياً");
    }
}

// 3. تنفيذ التبادل (Swap)
async function executeSwap() {
    if (!dexContract) return showStatus("اربط المحفظة أولاً", "error");
    const val = document.getElementById('swapAmountIn').value;
    const isA = document.getElementById('tokenInSelect').value === "TokenA";

    try {
        showStatus("جاري معالجة التبادل...", "info");
        const amountInWei = ethers.utils.parseEther(val);
        let tx;

        // استدعاء الدالة المناسبة بناءً على كود الـ Smart Contract [cite: 11, 13]
        if (isA) {
            tx = await dexContract.swapAforB(amountInWei); [cite: 10]
        } else {
            tx = await dexContract.swapBforA(amountInWei); [cite: 12]
        }
        
        await tx.wait();
        showStatus("تمت عملية التبادل بنجاح!", "success");
    } catch (e) {
        showStatus("فشلت العملية: " + (e.reason || e.message), "error");
    }
}

// 4. إضافة سيولة للمجمع (Add Liquidity)
async function executeAddLiquidity() {
    if (!dexContract) return;
    const a = document.getElementById('amountA').value;
    const b = document.getElementById('amountB').value;

    try {
        showStatus("جاري إضافة السيولة للمجمع...", "info");
        const tx = await dexContract.addLiquidity( [cite: 5]
            ethers.utils.parseEther(a),
            ethers.utils.parseEther(b)
        );
        await tx.wait();
        showStatus("تمت إضافة السيولة بنجاح!", "success");
    } catch (e) {
        showStatus("فشل إيداع السيولة: " + (e.reason || e.message), "error");
    }
}

// دالة مساعدة لعرض الرسائل
function showStatus(m, type) {
    const s = document.getElementById('statusMessage');
    s.style.display = "block";
    s.innerText = m;
    if (type === "success") s.style.color = "#34d399";
    else if (type === "error") s.style.color = "#fca5a5";
    else s.style.color = "#94a3b8";
}