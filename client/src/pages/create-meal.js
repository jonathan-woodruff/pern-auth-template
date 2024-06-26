/* the page that the user sees upon authentication */
/* When the page loads, useEffect will check if the user is authenticated. If so, it will show the private information. If the user is not authenticated, it will log them out */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProtectedInfo, fetchProtectedInfoSSO, onLogout } from '../api/auth';
import Layout from '../components/layout';
import { unauthenticateUser, notSSO, assignUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { createMealValidation } from '../validation/forms';
import { onCreateMeal } from '../api/inapp';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const defaultTheme = createTheme();

const CreateMeal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ssoLogin, userEmail } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [mealName, setMealName] = useState('');
  const [values, setValues] = useState([
    { ingredient: '', ingredientQuantity: '1', ingredientCategory: 'produce', used: false, showRemove: false }
  ]);

  const logout = async () => {
    try {
      await onLogout();
      dispatch(notSSO());
      dispatch(unauthenticateUser());
      dispatch(assignUser({ userEmail: null }));
      localStorage.removeItem('isAuth');
      localStorage.removeItem('userEmail');
    } catch(error) {
      console.log(error.response);
    }
  };

  const protectedInfo = async () => {
    try {
      const { data } = ssoLogin ? await fetchProtectedInfoSSO() : await fetchProtectedInfo();
      setProtectedData(data.info);
      setLoading(false);
    } catch(error) {
      logout(); //if the user isn't property authenticated using the token on the cookie or there is some other issue, this will force logout thus not allowing a user to gain unauthenticated access
    }
  };

  useEffect(() => {
    protectedInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //validate input client side
    const message = createMealValidation(mealName, values);
    if (message !== 'valid') {
      alert(message);
      return
    }
    //save the meal to the database
    try {
      await onCreateMeal(userEmail, mealName, values);
      navigate('/meals');
    } catch(error) {
      console.log(error.response.data.errors[0].msg); //error from axios
    }
  };

  const handleChange = index => (e) => {
    //set the state value to whatever the user entered
    const data = [...values];
    data[index][e.target.name] = e.target.value;
    setValues(data);
    //if the ingredients row is new/unchanged until now, flag it as changed and add a new row for the user
    if (!data[index]['used']) {
      data[index]['used'] = true;
      if (index !== 0) data[index]['showRemove'] = true;
      setValues([...values, { ingredient: '', ingredientQuantity: '1', ingredientCategory: 'produce', used: false, showRemove: false}]);
    }
  };

  const handleRemove = index => (e) => {
    const data = [...values];
    data.splice(index, 1);
    setValues(data);
  }

  const handleMealNameChange = (e) => {
    setMealName(e.target.value);
  };

  return loading ? (
    <Layout>
      <h1>Loading...</h1>
    </Layout>
  ) : (
    <div>
      <Layout>
        <ThemeProvider theme={defaultTheme}>
          <Container component="main">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Create a Meal
              </Typography>
              <Box component="form" onSubmit={ (e) => handleSubmit(e) } noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="mealName"
                  label="Meal Name"
                  name="mealName"
                  value={ mealName }
                  onChange={ (e) => handleMealNameChange(e) }
                  autoComplete="Meal Name"
                  autoFocus
                />
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Box sx={{ mt: 2 }}>
                    { values.map((input, index) => {
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mt: 0 }}>
                              <TextField 
                                margin="normal"
                                id="ingredient"
                                label="Ingredient"
                                name="ingredient"
                                value={ values[index].ingredient }
                                onChange={ handleChange(index) }
                                autoComplete="Ingredient"
                                sx={{ mr: 1 }}
                              />
                              <TextField 
                                margin="normal"
                                id="ingredientQuantity"
                                label="Quantity"
                                name="ingredientQuantity"
                                value={ values[index].ingredientQuantity }
                                onChange={ handleChange(index) }
                                autoComplete="Quantity" 
                                type="number"
                                InputProps={{ inputProps: { min: 1 } }}                               
                                sx={{ mr: 1, width: '100px' }}
                              />
                            </Box>
                            <Box sx={{ mt: 1, flexDirection: 'column' }}>
                              <Select
                                  labelId="category"
                                  id="ingredientCategory"
                                  name="ingredientCategory"
                                  value={ values[index].ingredientCategory }
                                  label="Category"
                                  onChange={ handleChange(index) }
                              >
                                  <MenuItem value="dairy">Dairy</MenuItem>
                                  <MenuItem value="meat">Meat</MenuItem>
                                  <MenuItem value="produce">Produce</MenuItem>
                                  <MenuItem value=""></MenuItem>
                              </Select>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                            { values[index].showRemove ?
                              <IconButton 
                                aria-label="remove" 
                                color="primary" 
                                onClick={ handleRemove(index) }
                                sx={{ ml: 2 }}
                              >
                                <RemoveCircleIcon />
                              </IconButton> :
                              <></>
                            }
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2 }}
                >
                  Save and Create
                </Button>
              </Box>
            </ Box>
          </ Container>
        </ ThemeProvider >
      </Layout>
    </div>
  )
  
};

export default CreateMeal;