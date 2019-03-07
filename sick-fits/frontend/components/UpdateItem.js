import React, { Component } from 'react';
import {Mutation, Query} from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import { roundToNearestMinutes } from 'date-fns';

const SINGLE_ITEM_QUERY=gql`
    query SINGLE_ITEM_QUERY($id:ID!){
        item(where:{id:$id}){
            id
            title
            description
            largeImage
            price
        }
    }
`;

const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $id: ID!
        $title: String
        $description: String
        $price: Int
    ){
        updateItem(  
            id:$id
            title : $title
            description : $description
            price : $price
        ) {id, title, description, price}
    }
`;

export default class UpdateItem extends Component {
    state={
    };
    handleChange = (e)=>{
        const {name, type, value} = e.target;
        const val = type==='number'?parseFloat(value):value;
        this.setState({[name]:val});
    };

    updateItem = async (e, updateItemMutation) =>{
        e.preventDefault();
        console.log(this.state);
        const res = await updateItemMutation({
            variables:{
                id: this.props.id,
                ...this.state,
            },
        });
        console.log(res);

    };

  render() {
    return (
        <Query query={SINGLE_ITEM_QUERY} variables={{id:this.props.id}}>
            {({data, loading})=>{
                if (loading) return <p>loading...</p>;
                if (!data.item) return <p>no item found for id:{this.props.id}...</p>;
                return(
                    <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                    {(updateItem, {loading, error})=>(
                    <Form onSubmit = {e=> this.updateItem(e, updateItem)}>
                        <Error error={error}/>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <label htmlFor="image" >
                                Image
                                {data.item.largeImage && <img src={data.item.largeImage} alt="Preview"/>}
                            </label>
                            <label htmlFor="title" >
                                Title
                                <input type="text" 
                                    id="title" 
                                    name="title" 
                                    placeholder="title" 
                                    defaultValue={data.item.title}
                                    onChange={this.handleChange}
                                    required/>
                            </label>
                            <label htmlFor="price" >
                                Price
                                <input type="number" 
                                    id="price" 
                                    name="price" 
                                    placeholder="Price" 
                                    defaultValue={data.item.price}
                                    onChange={this.handleChange}
                                    required/>
                            </label>
                            <label htmlFor="description" >
                                Description
                                <textarea type="text" 
                                    id="description" 
                                    name="description" 
                                    placeholder="Enter a description" 
                                    defaultValue={data.item.description}
                                    onChange={this.handleChange}
                                    required/>
                            </label>
                            <button type="submit">Sav{loading?'ing':'e'} changes</button>                          
                        </fieldset>
                    </Form>
                    )}
                    </Mutation>
                )
            }
            }</Query>
    )
  }
}

export {UPDATE_ITEM_MUTATION};
