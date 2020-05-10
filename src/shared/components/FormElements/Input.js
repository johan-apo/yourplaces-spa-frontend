import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

const inputReducer = (state, action) => { //recibe el initial state y un action
  switch (action.type) {
    // cuando cambie el input haz esto
    case 'CHANGE':
      return {
        ...state, // copia el state
        value: action.val, // recoge el valor del input
        isValid: validate(action.val, action.validators) // valida, retorna booleano
      };
    case 'TOUCH': {
      // cuando el input sea tocado haz esto
      return {
        ...state, // copia state
        isTouched: true
      }
    }
    default:
      return state;
  }
};

const Input = props => {
  // inputState el state actual y dinamico
  // dispatch ejecuta cambios en el inputState acorde el action
  // inputReducer son las acciones a ejecutar
  // segundo argumento es el state inicial
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || '', // si existe el prop, usalo
    isTouched: false,
    isValid: props.initialValid || false // si existe el prop, usalo
  });

  const { id, onInput } = props; // recibe id y la funcion inputHandler
  const { value, isValid } = inputState; // value del input y si es valido isValid

  useEffect(() => {
    onInput(id, value, isValid) // ejecuta onInput (funcion pasada por parent como prop)
  }, [id, value, isValid, onInput]);

  const changeHandler = event => {
    dispatch({
      type: 'CHANGE',
      val: event.target.value,
      validators: props.validators
    });
  };

  const touchHandler = () => {
    dispatch({
      type: 'TOUCH'
    });
  };

  const element =
    props.element === 'input' ? (
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );

  return (
    <div
      className={`form-control ${!inputState.isValid && inputState.isTouched &&
        'form-control--invalid'}`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;
