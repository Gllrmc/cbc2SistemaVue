<template>
    <v-container fluid>
        <v-row align="start">
            <v-col>
                <v-data-table
                :headers="headers"
                :items="asocuentas"
                :search="search"
                class="elevation-1"
                no-data-text="Nada para mostrar"
                >
                <template v-slot:top>
                    <v-toolbar flat color="white">
                        <div class="ma-2">
                            <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                        </div>
                        <v-toolbar-title>Asociación Cuentas</v-toolbar-title>
                        <v-snackbar
                            v-model="snackbar"
                            :timeout="timeout"
                            right
                            color="error"
                            >
                            {{ snacktext }}
                            <v-btn 
                                color="error"
                                dark
                                vertical
                                text
                                @click="snackbar = false"
                            >
                                Cerrar
                            </v-btn>
                        </v-snackbar>                   
                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>
                        <v-spacer></v-spacer>
                        <v-text-field label="Búsqueda" outlined v-model="search" append-icon="search" single-line hide-details></v-text-field>
                        <v-spacer></v-spacer>
                        <v-dialog v-model="dialog" max-width="600px">
                            <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
                            </template>
                            <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container grid-list-md>
                                    <v-row dense>
                                        <v-col cols="12" sm="9" md="9">
                                            <v-autocomplete 
                                                v-model="empresaId"
                                                clearable
                                                :items = "empresas"
                                                label="Empresa">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="3" md="3">
                                            <v-text-field v-model="orden" label="Orden"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-select v-model="bancuentaId" :items = "bancuentas" label="Cuenta Banco"></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-select v-model="concuentaId" :items = "concuentas" label="Cuenta Contable"></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="12" md="12" v-show="valida">
                                            <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v">
                                            </div>
                                        </v-col> 
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                                <v-btn color="blue darken-1" text @click="guardar">Guardar</v-btn>
                            </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="adModal" max-width="290">
                            <v-card>
                                <v-card-title class="headline" v-if="adAccion==1">¿Activar Banco?</v-card-title>
                                <v-card-title class="headline" v-if="adAccion==2">Bloquear Banco?</v-card-title>
                                <v-card-text>
                                    Estás a punto de 
                                    <span v-if="adAccion==1">Activar </span>
                                    <span v-if="adAccion==2">Bloquear </span>
                                    el Banco {{ adNombre }}
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer/>
                                    <v-btn small @click="activarDesactivarCerrar">Cancel
                                    <v-icon>cancel</v-icon>
                                    </v-btn>
                                    <v-btn small v-if="adAccion==1" @click="activar">Activar
                                    <v-icon>lock_open</v-icon>
                                    </v-btn>
                                    <v-btn small v-if="adAccion==2" @click="desactivar">Bloquear
                                    <v-icon>lock</v-icon>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon
                    small
                    class="mr-2"
                    @click="editItem(item)"
                    >
                    edit
                    </v-icon>
                    <v-icon
                    small
                    @click="deleteItem(item)"
                    >
                    delete
                    </v-icon>
                        <template v-if="item.activo">
                            <v-icon
                            small
                            @click="activarDesactivarMostrar(2,item)"
                            >
                            block
                            </v-icon>
                        </template>
                        <template v-else>
                            <v-icon
                            small
                            @click="activarDesactivarMostrar(1,item)"
                            >
                            check
                            </v-icon>
                    </template>
                </template>
                <template v-slot:[`item.activo`]="{ item }">
                    <td>
                        <div v-if="item.activo">
                            <span class="blue--text">Activo</span>
                        </div>
                        <div v-else>
                            <span class="red--text">Inactivo</span>
                        </div>
                    </td>
                </template>
                <template v-slot:[`item.fecalta`]="{ item }">
                    <td>{{ item.fecalta.substr(0, 16) }}</td>
                </template>
                <template v-slot:[`item.fecumod`]="{ item }">
                    <td>{{ item.fecumod.substr(0, 16) }}</td>
                </template>
                <template v-slot:no-data>
                    <v-btn color="primary" @click="listar">Resetear</v-btn>
                </template>
                </v-data-table>

            </v-col>
        </v-row>
    </v-container>
</template>
<script>
  import axios from 'axios'
  import jsPDF from 'jspdf'
  import autoTable from 'jspdf-autotable';
  export default {
    data: () => ({
        snackbar:false,
        snacktext: '',
        timeout: 4000,
        asocuentas: [],
        empresas: [],
        bancuentas: [],
        concuentas: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'start', sortable: false },
            { text: 'Orden', value: 'orden', align: 'start', sortable: true },
            { text: 'Descripcion', value: 'descripcion', align: 'start', sortable: true },
            { text: 'Empresa', value: 'empresa', align: 'start', sortable: true },
            { text: 'Cuenta de Banco', value: 'bancuenta', align: 'start', sortable: true },
            { text: 'Cuenta Contable', value: 'concuenta', align: 'start', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', sortable: true }                   
        ],
        search:'',
        editedIndex: -1,
        id: '',
        empresaId: '',
        orden: '',
        bancuentaId: '',
        bancuenta: '',
        concuentaId: '',
        concuenta: '',
        iduseralta:'',
        fecalta:'',
        iduserumod:'',
        fecumod:'',
        activo:false,                 
        valida: 0,
        validaMensaje:[],
        adModal: 0,
        adAccion: 0,
        adNombre: '',
        adId: ''             
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo Banco' : 'Actualizar Banco'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
    },

    created () {
      this.listar()
      this.select()
    },

    methods: {
        crearPDF(){
            var columns = [
                {title: "Empresa", dataKey: "empresa"},
                {title: "Orden", dataKey: "orden"},
                {title: "Cuenta Banco", dataKey: "bancuenta"},
                {title: "Cuenta Contable", dataKey: "concuenta"},
                {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.asocuentas.map(function(x){
                rows.push({empresa:x.empresa,orden:x.orden,bancuenta:x.bancuenta,concuenta:x.concuenta,activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Asociacion Cuentas", 40, 30);
                }
            });
            doc.save('Asocuentas.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            // console.log(configuracion);
            axios.get('api/Asocuentas/Listar',configuracion).then(function(response){
                // console.log(response);
                me.asocuentas=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        select(){
            let me=this;
            var empresasArray=[];
            var bancuentasArray=[];
            var concuentasArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Empresas/Select',configuracion).then(function(response){
                // console.log(response);
                empresasArray=response.data;
                empresasArray.map(function(x){
                    me.empresas.push({text: x.nombre, value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Bancuentas/Select',configuracion).then(function(response){
                // console.log(response);
                bancuentasArray=response.data;
                bancuentasArray.map(function(x){
                    me.bancuentas.push({text: x.banco+x.tipo+x.moneda+x.numcuenta, value:x.id, empresaId:x.empresaId});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Concuentas/Select',configuracion).then(function(response){
                // console.log(response);
                concuentasArray=response.data;
                concuentasArray.map(function(x){
                    me.concuentas.push({text: x.apporigen+x.moneda+x.numcuenta, value:x.id, empresaId:x.empresaId});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        editItem (item) {
                this.id=item.id;
                this.orden=item.orden;
                this.descripcion = item.descripcion;
                this.empresaId=item.empresaId;
                this.bancuentaId=item.bancuentaId;
                this.concuentaId=item.concuentaId;
                this.iduseralta=item.iduseralta;
                this.fecalta=item.fecalta;
                this.iduserumod=item.iduserumod;
                this.fecumod=item.fecumod;
                this.activo=item.activo;                
                this.editedIndex=1;
                this.dialog = true
        },
        deleteItem (item) {
            var me=this;
            var resulta = confirm('Esta seguro de querer borrar el registro?');
            if (resulta) {
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.delete('api/Asocuentas/Eliminar/'+item.id,configuracion).then(function(response){
                    me.close();
                    me.listar();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        close () {
            this.dialog = false
            this.limpiar();

        },
        limpiar(){
            this.id="";
            this.orden="";
            this.descripcion="";
            this.bancuentaId="";
            this.concuentaId="";
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
            this.activo = false;                  
            this.editedIndex=-1;
        },
        guardar () {
            let me=this;
            if (me.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + me.$store.state.token};
            let configuracion= {headers : header};
            if (me.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                axios.put('api/Asocuentas/Actualizar',{
                    'Id':me.id,
                    'empresaId': me.empresaId,
                    'orden': me.orden,
                    'descripcion': (me.bancuentas.find(x => x.value===me.bancuentaId && x.empresaId===me.empresaId)["text"]) + "/" + (me.concuentas.find(x => x.value===me.concuentaId && x.empresaId===me.empresaId)["text"]),
                    'bancuentaId': me.bancuentaId,
                    'concuentaId': me.concuentaId,
                    'iduseralta': me.iduseralta,
                    'fecalta': me.fecalta,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                        
                },configuracion).then(function(response){
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            } else {
                //Código para guardar
                axios.post('api/Asocuentas/Crear',{
                    'empresaId': me.empresaId,
                    'orden': me.orden,
                    'descripcion': (me.bancuentas.find(x => x.value===me.bancuentaId && x.empresaId===me.empresaId)["text"]) + "/" + (me.concuentas.find(x => x.value===me.concuentaId && x.empresaId===me.empresaId)["text"]),
                    'bancuentaId': me.bancuentaId,
                    'concuentaId': me.concuentaId,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        validar(){
            this.valida=0;
            this.validaMensaje=[];

            if (this.orden.length<3 || this.orden.length>3){
                this.validaMensaje.push("El orden debe tener más de 3 caracteres.");
            }
            if (!this.empresaId){
                this.validaMensaje.push("Ingrese una Empresa.");
            }
            if (!this.bancuentaId){
                this.validaMensaje.push("Seleccione un Cuenta Bancaria.");
            }
            if (!this.concuentaId){
                this.validaMensaje.push("Seleccione una Cuenta Contable.");
            }
            if (this.validaMensaje.length){
                this.valida=1;
            }
            return this.valida;
        },

        activarDesactivarMostrar(accion,item){
            this.adModal=1;
            this.adNombre=item.nombre;
            this.adId=item.id;                
            if (accion==1){
                this.adAccion=1;
            }
            else if (accion==2){
                this.adAccion=2;
            }
            else{
                this.adModal=0;
            }
        },
        activarDesactivarCerrar(){
            this.adModal=0;
        },
        activar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Asocuentas/Activar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        desactivar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Asocuentas/Desactivar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        }
    },
  }
</script>
