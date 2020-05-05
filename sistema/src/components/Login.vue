<template>
    <v-content>
        <v-container
        fluid
        >
        <v-row
            align="center"
            justify="center"
        >
            <v-col
            cols="12"
            sm="8"
            md="4"
            >
            <v-card class="elevation-12">
                <v-toolbar
                color="primary"
                dark
                flat
                >
                    <v-toolbar-title>Acceso al Sistema</v-toolbar-title>
                    <v-spacer />
                </v-toolbar>
                <v-card-text>
                <v-form>
                    <v-text-field v-model="email" color="accent" label="Email" prepend-icon="person" required>
                    </v-text-field>
                    <v-text-field v-model="password" type="password" color="accent" label="Password" prepend-icon="lock" required>
                    </v-text-field>
                </v-form>
                <v-row class="red--text" v-if="error">
                    {{error}}
                </v-row>
                </v-card-text>
                <v-card-actions class="px-3 pb-3">
                <v-spacer />
                <v-btn @click="ingresar" color="primary">Ingresar</v-btn>
                </v-card-actions>
            </v-card>
            </v-col>
        </v-row>
        </v-container>
    </v-content>
</template>

<script>
import axios from 'axios'
export default {
    data(){
        return {
            source: String,
            email: '',
            password: '',
            error: null
        }
    },
    methods :{
        ingresar(){
            this.error=null;
            axios.post('api/Usuarios/Login', {email: this.email, password: this.password})
            .then(respuesta => {
                return respuesta.data
            })
            .then(data => {        
                this.$store.dispatch("guardarToken", data.token)
                this.$router.push({ name: 'home' })
            })
            .catch(err => {
                console.log(err.response);
                if (err.response.status==400){
                    this.error="No es un email válido";
                } else if (err.response.status==404){
                    this.error="No existe el usuario o sus datos son incorrectos";
                }else{
                    this.error="Ocurrió un error";
                }
                console.log(err)
            })
        }
    }
    
}
</script>