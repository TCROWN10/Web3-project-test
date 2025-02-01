import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";

export default function ClassRegistration() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  const contractAddress = "0xF24Ce2cA7966d67ca3A6A3244Ee064636Ae99c89"; // Replace with your contract address

  // Function to connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      console.log("Requesting MetaMask connection...");
      
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, abi, signer);

      setContract(contractInstance);
      console.log("Wallet connected:", accounts[0]);
    } catch (error) {
      console.error("MetaMask connection failed:", error);
      alert("MetaMask connection failed. Please check your wallet.");
    }
  };

  // Function to register a student
  const handleRegister = async () => {
    if (!contract) return alert("Connect wallet first!");

    try {
      const tx = await contract.registerStudent(studentId, name);
      await tx.wait();
      setStudents([...students, { id: studentId, name }]);
      setName("");
      setStudentId("");
      alert("Student registered successfully!");
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Failed to register student.");
    }
  };

  // Function to fetch student details
  const handleFetchDetails = async () => {
    if (!contract) return alert("Connect wallet first!");

    try {
      const student = await contract.getStudent(studentId);
      if (!student.isRegistered) {
        alert("Student not found!");
        return;
      }
      setSelectedStudent({ id: studentId, name: student.name });
    } catch (error) {
      console.error("Error fetching student details:", error);
      alert("Failed to fetch student details.");
    }
  };

  // Function to remove a student
  const handleRemove = async () => {
    if (!contract) return alert("Connect wallet first!");

    try {
      const tx = await contract.removeStudent(studentId);
      await tx.wait();
      setStudents(students.filter((s) => s.id !== studentId));
      alert("Student removed successfully!");
    } catch (error) {
      console.error("Error removing student:", error);
      alert("Failed to remove student.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-blue-500 to-indigo-700 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4">🎓 Class Registration</h2>

      {/* Display Wallet Address or Connect Button */}
      <div className="mb-4">
        {account ? (
          <p className="text-green-600 font-semibold">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
        ) : (
          <button 
            onClick={connectWallet} 
            className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-600"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Registration Inputs */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Student Name"
          className="border p-2 w-full rounded focus:ring focus:ring-indigo-300"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Student ID"
          className="border p-2 w-full rounded focus:ring focus:ring-indigo-300"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={handleRegister} 
          className="bg-green-900 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
        >
          Register Student
        </button>
        <button 
          onClick={handleFetchDetails} 
          className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600"
        >
          Get Student
        </button>
        <button 
          onClick={handleRemove} 
          className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
        >
          Remove Student
        </button>
      </div>

      {/* Display Registered Students */}
      <h3 className="mt-6 text-lg font-semibold">Registered Students</h3>
      <ul className="mt-2">
        {students.map((student) => (
          <li key={student.id} className="flex justify-between items-center bg-gray-100 p-2 rounded mt-2">
            <span>{student.name} ({student.id})</span>
          </li>
        ))}
      </ul>

      {/* Display Selected Student Details */}
      {selectedStudent && (
        <div className="mt-4 p-4 bg-gray-200 rounded">
          <h4 className="font-semibold">Student Details</h4>
          <p>Name: {selectedStudent.name}</p>
          <p>ID: {selectedStudent.id}</p>
        </div>
      )}
    </div>
  );
}
