import axios from 'axios';
import api from '../api';


export  const leetcodeService =async(username) => {
    return api.get(`/leetcode/${username}`);
}
