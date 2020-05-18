<template>
    <v-container fluid>
        <v-row align="start">
            <v-col>
                <v-data-table
                :headers="headers"
                :items="personas"
                :search="search"
                class="elevation-1"
                no-data-text="Nada para mostrar"
                >
                <template v-slot:top>
                    <v-toolbar flat color="white">
                        <div class="ma-2">
                            <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                        </div>
                        <v-toolbar-title>Personas</v-toolbar-title>
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
                                        <v-col cols="12" sm="12" md="12">
                                            <v-text-field v-model="nombre" label="Nombre">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="3" md="3">
                                            <v-text-field v-model="emailpersonal" label="eMail">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="3" md="3">
                                            <v-text-field v-model="telefonopersonal" label="Telefono">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="3" md="3">
                                            <v-select v-model="tipodocumento" 
                                            :items="tipodocumentos" label="Tipo Doc.">
                                            </v-select>
                                        </v-col>                                
                                        <v-col cols="12" sm="3" md="3">
                                            <v-text-field v-model="numdocumento" label="Nro. Documento">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="10" md="10">
                                            <v-text-field v-model="domicilio" label="Domicilio">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="2" md="2">
                                            <v-text-field v-model="cpostal" label="C.P.">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4">
                                            <v-text-field v-model="localidad" label="Localidad">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4">
                                            <v-autocomplete 
                                                v-model="paisId"
                                                clearable
                                                :items = "paises"
                                                :search-input.sync="searchpa"
                                                @change="filterProvincias()"
                                                label = "País">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4">
                                            <v-autocomplete 
                                                v-model="provinciaId"
                                                clearable
                                                :items = "provinciasf" 
                                                :search-input.sync="searchpr"                                    
                                                @change="asignaPais()"                                   
                                                label = "Provincia">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4">
                                            <input type="checkbox" id="esempleado" v-model="esempleado">
                                            <label for = "esempleado"> Es empleado?</label>
                                        </v-col>                                
                                        <v-col cols="12" sm="4" md="4">
                                            <input type="checkbox" id="esproveedor" v-model="esproveedor">
                                            <label for = "esproveedor"> Es proveedor?</label>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4">
                                            <input type="checkbox" id="escliente" v-model="escliente">
                                            <label for = "escliente"> Es Cliente?</label>
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
                        <v-dialog v-model="adModal" max-width="390">
                            <v-card>
                                <v-card-title class="headline" v-if="adAccion==1">¿Activar Persona?</v-card-title>
                                <v-card-title class="headline" v-if="adAccion==2">Bloquear Persona?</v-card-title>
                                <v-card-text>
                                    Estás a punto de 
                                    <span v-if="adAccion==1">Activar </span>
                                    <span v-if="adAccion==2">Bloquear </span>
                                    la Persona: {{ adNombre }}
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
                <template v-slot:item.actions="{ item }">
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
                <template v-slot:item.activo="{ item }">
                    <td>
                        <div v-if="item.activo">
                            <span class="blue--text">Activo</span>
                        </div>
                        <div v-else>
                            <span class="red--text">Inactivo</span>
                        </div>
                    </td>
                </template>
                <template v-slot:item.esempleado="{ item }">
                        <td>
                            <div v-if="item.esempleado">
                                <span class="green--text">Si</span>
                            </div>
                            <div v-else>
                                <span class="blue--text">No</span>
                            </div>
                        </td>                   
                </template>
                <template v-slot:item.esproveedor="{ item }">
                        <td>
                            <div v-if="item.esproveedor">
                                <span class="green--text">Si</span>
                            </div>
                            <div v-else>
                                <span class="blue--text">No</span>
                            </div>
                        </td>                   
                </template>
                <template v-slot:item.escliente="{ item }">
                        <td>
                            <div v-if="item.escliente">
                                <span class="green--text">Si</span>
                            </div>
                            <div v-else>
                                <span class="blue--text">No</span>
                            </div>
                        </td>                   
                </template>
                <template v-slot:item.fecalta="{ item }">
                    <td>{{ item.fecalta.substr(0, 16) }}</td>
                </template>
                <template v-slot:item.fecumod="{ item }">
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
        personas:[],
        personasf:[],
        paises: [],
        provincias: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
            { text: 'Nombre Completo', value: 'nombre', align: 'start', sortable: true },
            { text: 'eMail', value: 'emailpersonal', align: 'start', sortable: true  },
            { text: 'Telefono', value: 'telefonopersonal', align: 'start', sortable: true  },
            { text: 'Empleado?', value: 'esempleado', align: 'start', sortable: true  },
            { text: 'Proveedor?', value: 'esproveedor', align: 'start', sortable: true  },
            { text: 'Cliente?', value: 'escliente', align: 'start', sortable: true  },
            { text: 'Domicilio', value: 'domicilio', align: 'start', sortable: true },
            { text: 'Localidad', value: 'localidad', align: 'start', sortable: true },
            { text: 'C.P.', value: 'cpostal', align: 'start', sortable: true },
            { text: 'Provincia', value: 'provincia', align: 'start', sortable: true  },
            { text: 'Pais', value: 'pais', align: 'start', sortable: true  },
            { text: 'Tipo Doc.', value: 'tipodocumento', sortable: true  },
            { text: 'Númenro', value: 'numdocumento', sortable: true  },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', align: 'center', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', align: 'start', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', align: 'center', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', align: 'start', sortable: true }                   
        ],
        search: '',
        searchpa: '',
        searchpr: '',
        editedIndex: -1,
        id: '',
        paisId:'',
        provinciaId:'',
        nombre: '',
        domicilio: '',
        localidad: '',
        cpostal: '',
        emailpersonal: '',
        telefonopersonal: '',
        tipodocumentos: ['DNI','PAS','LC','CI'],
        tipodocumento: '',
        numdocumento: '',
        esempleado: false,
        esproveedor: false,
        escliente: false,
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
        return this.editedIndex === -1 ? 'Nueva persona' : 'Actualizar persona'
      },
    },

    watch: {
        dialog (val) {
            val || this.close()
        },
    },

    created () {
        this.select();
        this.listar()
    },

    methods: {
        crearPDF(){
            var columns = [
                    {title: "Nombre", dataKey: "nombre"},
                    {title: "eMail", dataKey: "emailpersonal"}, 
                    {title: "Teléfono", dataKey: "telefonopersonal"}, 
                    {title: "Maneja Fondos", dataKey: "manejafondos"},
                    {title: "DIR", dataKey: "esdirector"},
                    {title: "EP", dataKey: "esep"},
                    {title: "LP", dataKey: "eslp"},
                    {title: "CP", dataKey: "escp"},
                    {title: "Empleado", dataKey: "esempleado"},
                    {title: "Prov", dataKey: "esproveedor"},
                    {title: "Cli", dataKey: "escliente"},
                    {title: "Domicilio", dataKey: "domicilio"}, 
                    {title: "Localidad", dataKey: "localidad"},
                    {title: "C.P.", dataKey: "cpostal"},
                    {title: "Provincia", dataKey: "provincia"}, 
                    {title: "Pais", dataKey: "pais"}, 
                    {title: "Tipo Doc.", dataKey: "tipodocumento"},
                    {title: "Número", dataKey: "numdocumento"},
                    {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.personas.map(function(x){
                    rows.push({nombre:x.nombre,emailpersonal:x.emailpersonal,
                    telefonopersonal:x.telefonopersonal,manejafondos:x.manejafondos, esdirector:x.esdirector, esep:x.esep,eslp:x.eslp,escp:x.escp,
                    esempleado:x.esempleado, esproveedor:x.esproveedor,escliente:x.escliente,
                    domicilio:x.domicilio,localidad:x.localidad,cpostal: x.cpostal, provincia:x.provincia,pais:x.pais,tipodocumento:x.tipodocumento,numdocumento:x.numdocumento,activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Personas", 40, 30);
                }
            });
            doc.save('Personas.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Personas/Listar',configuracion).then(function(response){
                //console.log(response);
                me.personas=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        select(){
            let me=this;
            var paisesArray=[];
            var provinciasArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Paises/Select',configuracion).then(function(response){
                // console.log(response);
                paisesArray=response.data;
                paisesArray.map(function(x){
                    me.paises.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Provincias/Select',configuracion).then(function(response){
                // console.log(response);
                provinciasArray=response.data;
                provinciasArray.map(function(x){
                    me.provincias.push({text: x.nombre,value:x.id, pais: x.paisId});
                    me.provinciasf=me.provincias;
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        asignaPais(){
            var ii = this.provincias.findIndex(p => p.value === this.provinciaId);
            this.paisId = this.provincias[ii].pais;
        },
        filterProvincias(){
            this.provinciasf = this.provincias.filter(x => x.pais === this.paisId);
            if (provinciaId) {
                var ii = this.provincias.findIndex(p => p.value === this.provinciaId);
                if (!this.paisId === this.provincias[ii].pais){
                    this.provinciaId="";
                }
            }
        },
        editItem (item) {
            this.id=item.id;
            this.provinciaId=item.provinciaId;
            this.paisId=item.paisId;
            this.nombre=item.nombre;
            this.domicilio=item.domicilio;
            this.localidad=item.localidad;
            this.cpostal=item.cpostal;                
            this.emailpersonal=item.emailpersonal;
            this.telefonopersonal=item.telefonopersonal;
            this.tipodocumento=item.tipodocumento;
            this.numdocumento=item.numdocumento;
            this.esempleado=item.esempleado;
            this.esproveedor=item.esproveedor;
            this.escliente=item.escliente;
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
                axios.delete('api/Personas/Eliminar/'+item.id,configuracion).then(function(response){
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
            this.paisId="";
            this.provinciaId="";
            this.nombre="";
            this.domicilio="";
            this.localidad="";
            this.cpostal="";
            this.emailpersonal="";
            this.telefonopersonal="";
            this.tipodocumento="";
            this.numdocumento="";
            this.esempleado="";
            this.esproveedor="";
            this.escliente="";   
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
            this.activo = false;                  
            this.editedIndex=-1;
        },
        guardar () {
            if (this.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            if (this.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                let me=this;
                axios.put('api/Personas/Actualizar',{
                    'Id': me.id,
                    'paisId': me.paisId,
                    'provinciaId': me.provinciaId,
                    'nombre': me.nombre,
                    'domicilio': me.domicilio,
                    'localidad': me.localidad,
                    'cpostal': me.cpostal,
                    'emailpersonal': me.emailpersonal,
                    'telefonopersonal': me.telefonopersonal,
                    'tipodocumento': me.tipodocumento,
                    'numdocumento': me.numdocumento,
                    'esempleado': me.esempleado,
                    'esproveedor': me.esproveedor,
                    'escliente': me.escliente,
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
                let me=this;
                axios.post('api/Personas/Crear',{
                    'paisId':me.paisId,
                    'provinciaId':me.provinciaId,
                    'nombre': me.nombre,
                    'domicilio': me.domicilio,
                    'localidad': me.localidad,
                    'cpostal': me.cpostal,
                    'emailpersonal': me.emailpersonal,
                    'telefonopersonal': me.telefonopersonal,
                    'tipodocumento': me.tipodocumento,
                    'numdocumento': me.numdocumento,
                    'esempleado': me.esempleado,
                    'esproveedor': me.esproveedor,
                    'escliente': me.escliente,
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

            if (this.nombre.length<3 || this.nombre.length>100){
                this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos de 100 caracteres.");
            }
            if (!this.paisId){
                this.validaMensaje.push("Seleccione un país.");
            }
            if (!this.provinciaId){
                this.validaMensaje.push("Seleccione una provincia.");
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
            axios.put('api/Personas/Activar/'+this.adId,{},configuracion).then(function(response){
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
            axios.put('api/Personas/Desactivar/'+this.adId,{},configuracion).then(function(response){
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
